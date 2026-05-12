import { Link, NavLink, Route, Routes } from 'react-router-dom'
import { Home, LogIn, PlusCircle, UserCircle } from 'lucide-react'
import { useAuth } from './context/AuthContext'
import HomePage from './pages/HomePage'
import BusinessDetailPage from './pages/BusinessDetailPage'
import BusinessFormPage from './pages/BusinessFormPage'
import ReviewFormPage from './pages/ReviewFormPage'
import AuthPage from './pages/AuthPage'
import MyPage from './pages/MyPage'
import StaticPage from './pages/StaticPage'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <main className="page narrow">読み込み中...</main>
  if (!user) {
    return (
      <main className="page narrow">
        <div className="empty-state">
          <h1>ログインが必要です</h1>
          <p>口コミ投稿・Business登録・お気に入り機能を使うにはログインしてください。</p>
          <Link className="button primary" to="/auth">
            ログインへ
          </Link>
        </div>
      </main>
    )
  }

  return children
}

function Header() {
  const { user, profile } = useAuth()

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="WorkiReview home">
        <span className="brand-mark">W</span>
        <span className="brand-copy">
          <span className="brand-name">WorkiReview</span>
          <span className="brand-tagline">仕事・家の口コミを検索できるワーホリ情報プラットフォーム</span>
        </span>
      </Link>
      <nav className="nav-links" aria-label="メインナビゲーション">
        <NavLink to="/">
          <Home size={18} />
          <span>探す</span>
        </NavLink>
        <NavLink to="/new">
          <PlusCircle size={18} />
          <span>登録</span>
        </NavLink>
        {user ? (
          <NavLink to="/mypage">
            <UserCircle size={18} />
            <span>{profile?.nickname || 'マイページ'}</span>
          </NavLink>
        ) : (
          <NavLink to="/auth">
            <LogIn size={18} />
            <span>ログイン</span>
          </NavLink>
        )}
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <Link to="/terms">利用規約</Link>
      <Link to="/privacy">プライバシーポリシー</Link>
      <Link to="/contact">お問い合わせ</Link>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/businesses/:id" element={<BusinessDetailPage />} />
        <Route
          path="/businesses/:id/review"
          element={
            <RequireAuth>
              <ReviewFormPage />
            </RequireAuth>
          }
        />
        <Route
          path="/new"
          element={
            <RequireAuth>
              <BusinessFormPage />
            </RequireAuth>
          }
        />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/mypage"
          element={
            <RequireAuth>
              <MyPage />
            </RequireAuth>
          }
        />
        <Route path="/terms" element={<StaticPage type="terms" />} />
        <Route path="/privacy" element={<StaticPage type="privacy" />} />
        <Route path="/contact" element={<StaticPage type="contact" />} />
      </Routes>
      <Footer />
    </>
  )
}
