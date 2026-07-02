# PrintMyMemory - auto-place downloaded product models onto shelf slots.
# Drop .glb / .gltf / .obj / .stl files into blender/assets/products, then run
# this script inside Blender (or ask Claude to run it via MCP).

import bpy, os, math

ASSETS_DIR = os.path.join(os.path.dirname(bpy.data.filepath), "assets", "products")
TARGET_MAX_DIM = 0.24  # meters; products normalized to fit shelf height


def get_coll(name, parent=None):
    c = bpy.data.collections.get(name)
    if not c:
        c = bpy.data.collections.new(name)
        (parent or bpy.context.scene.collection).children.link(c)
    return c


def free_slots():
    out = []
    for o in bpy.data.objects:
        if o.name.startswith("SLOT_") and not o.children:
            out.append(o)
    # Fill eye-level shelves first (S3, S2), front positions first
    def key(s):
        parts = s.name.split("_")  # SLOT, A1, L3, n
        shelf = int(parts[2][1])
        pos = int(parts[3])
        order = {3: 0, 2: 1, 4: 2, 1: 3}[shelf]
        return (order, pos, parts[1])
    return sorted(out, key=key)


def import_file(path):
    before = set(bpy.data.objects)
    ext = os.path.splitext(path)[1].lower()
    if ext in (".glb", ".gltf"):
        bpy.ops.import_scene.gltf(filepath=path)
    elif ext == ".obj":
        bpy.ops.wm.obj_import(filepath=path)
    elif ext == ".stl":
        bpy.ops.wm.stl_import(filepath=path)
    else:
        return []
    return [o for o in bpy.data.objects if o not in before]


def place_products():
    done = bpy.context.scene.get("pmm_imported", "").split("|")
    products = get_coll("PMM_Products", bpy.data.collections.get("PMM_Shop"))
    slots = free_slots()
    placed, skipped = [], []

    files = sorted(f for f in os.listdir(ASSETS_DIR)
                   if f.lower().endswith((".glb", ".gltf", ".obj", ".stl")))
    for f in files:
        if f in done:
            continue
        if not slots:
            skipped.append(f)
            continue
        objs = import_file(os.path.join(ASSETS_DIR, f))
        meshes = [o for o in objs if o.type == "MESH"]
        if not meshes:
            for o in objs:
                bpy.data.objects.remove(o, do_unlink=True)
            skipped.append(f)
            continue

        # Group under one root empty
        root = bpy.data.objects.new("PRODUCT_" + os.path.splitext(f)[0], None)
        products.objects.link(root)
        for o in objs:
            if o.parent is None:
                o.parent = root
            for c in list(o.users_collection):
                c.objects.unlink(o)
            products.objects.link(o)

        # Normalize scale from combined bounds
        bpy.context.view_layer.update()
        mn = [1e9] * 3
        mx = [-1e9] * 3
        for o in meshes:
            for corner in o.bound_box:
                w = o.matrix_world @ mathutils_v(corner)
                for i in range(3):
                    mn[i] = min(mn[i], w[i]); mx[i] = max(mx[i], w[i])
        dims = [mx[i] - mn[i] for i in range(3)]
        s = TARGET_MAX_DIM / max(max(dims), 1e-6)
        root.scale = (s, s, s)
        # Sit on shelf: shift so min-z lands at slot z
        root.location = (0, 0, -mn[2] * s)

        slot = slots.pop(0)
        root.parent = slot
        done.append(f)
        placed.append((f, slot.name))

    bpy.context.scene["pmm_imported"] = "|".join(d for d in done if d)
    return placed, skipped


def mathutils_v(t):
    from mathutils import Vector
    return Vector(t)


if __name__ == "__main__":
    placed, skipped = place_products()
    print("Placed:", placed)
    print("Skipped:", skipped)
