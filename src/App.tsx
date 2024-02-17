import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';
import Room from './pages/Room';

function App() {
  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: <Home/>,
      },
      {
        path: "/room/:roomId",
        element: <Room/>,
      }
    ]
  );

  return (
    <RouterProvider router={router}/>
  )
}

export default App
