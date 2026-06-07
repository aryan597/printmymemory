import { Routes, Route } from 'react-router-dom';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Customize from './pages/Customize';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Reviews from './pages/Reviews';
import Contact from './pages/Contact';

function App() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <AnnouncementBar />
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default App;
