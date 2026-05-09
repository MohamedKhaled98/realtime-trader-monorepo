import classNames from 'classnames';
import { NavLink, useNavigate } from 'react-router';
import { useAuthUser, useClearSession } from '../store/authStore';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  classNames('rounded px-3 py-1.5 text-sm transition', {
    'bg-zinc-800 text-zinc-100': isActive,
    'text-zinc-400 hover:text-zinc-100': !isActive,
  });

export function Header() {
  const user = useAuthUser();
  const clearSession = useClearSession();
  const navigate = useNavigate();

  const onLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  return (
    <header className="mb-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold">Realtime Trader</h1>
      <nav className="flex items-center gap-1">
        <NavLink to="/" end className={linkClass}>
          Home
        </NavLink>
        <NavLink to="/news" className={linkClass}>
          News
        </NavLink>
        {user && (
          <>
            <span className="ml-3 text-sm text-zinc-400">{user.username}</span>
            <button
              type="button"
              onClick={onLogout}
              className="ml-1 rounded px-3 py-1.5 text-sm text-zinc-400 transition hover:text-zinc-100"
            >
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
