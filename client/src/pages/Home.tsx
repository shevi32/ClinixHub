import { Link } from "react-router-dom";
import {
  FaHeartbeat,
  FaCalendarCheck,
  FaUserFriends,
  FaShieldAlt,
  FaArrowLeft,
} from "react-icons/fa";
import heroImage from "../assets/clinic-hero.png";

const features = [
  {
    icon: <FaCalendarCheck className="text-joy-teal" />,
    title: "קביעת תורים בקליק",
    text: "לוח זמנים חי וזמין, בלי טלפונים ובלי לחכות בתור.",
  },
  {
    icon: <FaUserFriends className="text-joy-grape" />,
    title: "מעקב מטופלים חכם",
    text: "כל ההיסטוריה, הסיכומים וההתקדמות במקום אחד ונעים.",
  },
  {
    icon: <FaShieldAlt className="text-joy-coral" />,
    title: "פרטיות ואבטחה",
    text: "המידע הרפואי שלך מוגן ונגיש רק למי שמורשה לצפות בו.",
  },
];

const Home = () => (
  <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-purple-50" dir="rtl">
    <div className="joy-blob -top-24 -right-24 h-72 w-72 bg-joy-teal" />
    <div className="joy-blob top-1/3 -left-20 h-72 w-72 bg-joy-grape" style={{ animationDelay: "2s" }} />
    <div className="joy-blob bottom-0 right-1/4 h-64 w-64 bg-joy-sun" style={{ animationDelay: "4s" }} />

    <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-12">
      <div className="flex items-center gap-2 text-2xl font-extrabold text-slate-800">
        <span className="animate-wiggle text-3xl">🏥</span>
        Clinix<span className="text-joy-teal">Hub</span>
      </div>
      <nav className="flex items-center gap-3">
        <Link to="/login" className="joy-btn-ghost">
          התחברות
        </Link>
        <Link to="/register" className="joy-btn-primary">
          הרשמה חינם
        </Link>
      </nav>
    </header>

    <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 pb-16 pt-8 sm:px-12 lg:flex-row-reverse lg:gap-4">
      <div className="w-full max-w-lg lg:w-1/2">
        <img
          src={heroImage}
          alt="מטפלת ומטופלת מחייכות בקליניקה"
          className="w-full animate-float drop-shadow-2xl"
        />
      </div>

      <div className="w-full text-center lg:w-1/2 lg:text-right">
        <span className="joy-badge-scheduled mb-4 inline-flex">
          <FaHeartbeat /> הקליניקה החכמה שלך, אונליין
        </span>

        <h1 className="text-4xl font-extrabold leading-tight text-slate-800 sm:text-5xl">
          ניהול קליניקה
          <br />
          <span className="bg-joy-gradient bg-clip-text text-transparent">שמח, פשוט ואנושי 🌿</span>
        </h1>

        <p className="mx-auto mt-5 max-w-md text-lg text-slate-500 lg:mr-0">
          תורים, מטופלים וסיכומי טיפול — הכול במקום אחד צבעוני, נעים לשימוש
          ובנוי כדי לחסוך לך זמן.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
          <Link to="/register" className="joy-btn-warm text-base">
            בואו נתחיל <FaArrowLeft />
          </Link>
          <Link to="/login" className="joy-btn-soft text-base">
            יש לי כבר חשבון
          </Link>
        </div>
      </div>
    </main>

    <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20 sm:px-12">
      <div className="grid gap-6 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="joy-card p-6 text-right">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-2xl">
              {f.icon}
            </div>
            <h3 className="mb-1 text-lg font-bold text-slate-800">{f.title}</h3>
            <p className="text-sm text-slate-500">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default Home;
