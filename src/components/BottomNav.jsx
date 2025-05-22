import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  MapIcon,
  CalendarIcon,
  StarIcon,
  UserIcon,
} from "@heroicons/react/outline";

const BottomNav = () => {
  const { pathname } = useLocation();

  const navItems = [
    { name: "Home", icon: <HomeIcon className="h-6 w-6 icon-pop" />, path: "/" },
    { name: "Map", icon: <MapIcon className="h-6 w-6 icon-pop" />, path: "/map" },
    { name: "Calendar", icon: <CalendarIcon className="h-6 w-6 icon-pop" />, path: "/calendar" },
    { name: "Favorites", icon: <StarIcon className="h-6 w-6 icon-pop" />, path: "/account" },
    { name: "Account", icon: <UserIcon className="h-6 w-6 icon-pop" />, path: "/account" },
  ];

  const handleClick = (e) => {
    const icon = e.currentTarget.querySelector('.icon-pop');
    if (icon) {
      icon.classList.add('animate-pop');
      setTimeout(() => icon.classList.remove('animate-pop'), 300);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-md sm:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            onClick={handleClick}
            className={`ripple flex flex-col items-center text-xs transition-transform duration-150 active:scale-90 ${
              pathname === item.path ? "text-blue-600" : "text-gray-500"
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
