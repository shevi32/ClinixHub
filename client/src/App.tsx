import Register from './pages/Register'

const path = window.location.pathname

function App() {
  if (path === '/register') {
    return <Register />
  }

  return (
    <main style={{padding: '2rem', fontFamily: 'Arial, sans-serif'}}>
      <h1>Clinix Client</h1>
      <p>
        השרת רץ, אבל אין עדיין מסלול מוגדר לכתובת זו. כדי להגיע לעמוד הרשמה:
      </p>
      <p>
        <a href="/register">לעמוד הרשמה</a>
      </p>
    </main>
  )
}

export default App
