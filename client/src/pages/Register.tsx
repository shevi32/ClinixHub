function Register() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    alert('ההרשמה עדיין לא מחוברת לשרת, אבל הטופס שמור בדפדפן.')
  }

  return (
    <main style={{padding: '2rem', fontFamily: 'Arial, sans-serif'}}>
      <h1>Register</h1>
      <p>ברוכים הבאים לעמוד ההרשמה.</p>
      <form
        onSubmit={handleSubmit}
        style={{display: 'grid', gap: '1rem', maxWidth: '420px'}}
      >
        <label>
          שם משתמש
          <input type="text" name="username" placeholder="Username" />
        </label>
        <label>
          אימייל
          <input type="email" name="email" placeholder="Email" />
        </label>
        <label>
          סיסמה
          <input type="password" name="password" placeholder="Password" />
        </label>
        <button type="submit">הרשם</button>
      </form>
    </main>
  )
}

export default Register
