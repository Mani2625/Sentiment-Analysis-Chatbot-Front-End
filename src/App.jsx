// src/App.jsx
import ChatWindow from './components/ChatWindow';
import './index.css'; // Assuming you set up Tailwind or want basic CSS reset

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <ChatWindow />
    </div>
  );
}

export default App;