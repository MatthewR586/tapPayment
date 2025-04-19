// main.jsx or App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Checkout from './Checkout';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:address" element={<Checkout />} />
      </Routes>
    </BrowserRouter>
  );
}