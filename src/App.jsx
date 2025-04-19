// main.jsx or App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WertCheckout from './WertCheckout';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:address" element={<WertCheckout />} />
      </Routes>
    </BrowserRouter>
  );
}