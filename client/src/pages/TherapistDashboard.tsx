import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUserFriends,
  FaClipboardList,
  FaCalendarPlus,
  FaArrowLeft,
} from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

const quickLinks = [
  {
    to: "/appointments",
    icon: <FaCalendarAlt />,
    title: "ניהול תורים",
    text: "צפייה, עריכה, ביטול והשלמת תורים לכל המטופלים",
    accent: "from-teal-400 to-sky-400",
  },
  {
    to: "/patients",
    icon: <FaUserFriends />,
    title: "ניהול מטופלים",
    text: "רשימת המטופלים, פרטי קשר והוספת מטופל חדש",
    accent: "from-purple-400 to-fuchsia-400",
  },
  {
    to: "/treatments",
    icon: <FaClipboardList />,
    title: "סיכומי טיפול",
    text: "כתיבה וצפייה בסיכומי טיפול לכל מטופל",
    accent: "from-amber-400 to-orange-400",
  },
  {
    to: "/create-appointment",
    icon: <FaCalendarPlus />,
    title: "קביעת תור חדש",
    text: "יצירת תור חדש למטופל בלוח הזמנים",
    accent: "from-rose-400 to-pink-400",
  },
];

export default function TherapistDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const greetingName = user?.email?.split("@")[0] || "מטפל/ת";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-purple-50" dir="rtl">
      <div className="joy-blob -top-24 -left-24 h-72 w-72 bg-joy-sky" />
      <div className="joy-blob bottom-0 right-0 h-64 w-64 bg-joy-sun" style={{ animationDelay: "3s" }} />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10 sm:px-10">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 sm:text-4xl">
              שלום, {greetingName} <span className="animate-wiggle inline-block">👋</span>
            </h1>
            <p className="mt-2 text-slate-500">
              לוח הניהול שלך ב-ClinixHub — הכול נעים, צבעוני ובמקום אחד ✨
            </p>
          </div>
          <span className="joy-badge-completed">
            <span className="text-base">🩺</span> מטפל/ת מחובר/ת
          </span>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <button
              key={link.to}
              onClick={() => navigate(link.to)}
              className="joy-card group flex flex-col items-start gap-3 p-6 text-right"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${link.accent} text-xl text-white shadow-pop transition-transform group-hover:scale-110`}
              >
                {link.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800">{link.title}</h3>
              <p className="text-sm text-slate-500">{link.text}</p>
              <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-joy-teal opacity-0 transition-opacity group-hover:opacity-100">
                מעבר <FaArrowLeft className="text-xs" />
              </span>
            </button>
          ))}
        </div>

        <div className="joy-card mt-10 flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:justify-between sm:text-right">
          <div>
            <h2 className="text-xl font-bold text-slate-800">בקרוב: סיכומי טיפול חסויים 🔒</h2>
            <p className="mt-1 text-sm text-slate-500">
              כתיבת סיכום טיפול פרטי והפקת דרישת תשלום ישירות מכרטיס המטופל.
            </p>
          </div>
          <span className="joy-badge-pending shrink-0">בפיתוח</span>
        </div>
      </div>
    </div>
  );
}
