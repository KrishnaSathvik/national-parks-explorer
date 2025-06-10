import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  MapIcon,
  CalendarIcon,
  StarIcon,
  UserIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MapIcon as MapIconSolid,
  CalendarIcon as CalendarIconSolid,
  StarIcon as StarIconSolid,
  UserIcon as UserIconSolid,
  PaperAirplaneIcon as PaperAirplaneIconSolid
} from '@heroicons/react/24/solid';

const EnhancedBottomNav = () => {
  const { pathname } = useLocation();

  // ⛔️ Hide on login/signup/admin routes
  const hiddenRoutes = ["/login", "/signup", "/admin/login"];
  if (hiddenRoutes.includes(pathname)) return null;

  const navItems = [
    {
      name: "Home",
      icon: <HomeIcon className="h-6 w-6" />,
      iconSolid: <HomeIconSolid className="h-6 w-6" />,
      path: "/",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50"
    },
    {
      name: "Trips",
      icon: <PaperAirplaneIcon className="h-6 w-6" />,
      iconSolid: <PaperAirplaneIconSolid className="h-6 w-6" />,
      path: "/trip-planner",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50"
    },
    {
      name: "Events",
      icon: <CalendarIcon className="h-6 w-6" />,
      iconSolid: <CalendarIconSolid className="h-6 w-6" />,
      path: "/calendar",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50"
    },
    {
      name: "Favorites",
      icon: <StarIcon className="h-6 w-6" />,
      iconSolid: <StarIconSolid className="h-6 w-6" />,
      path: "/favorites",
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-yellow-50"
    },
    {
      name: "Account",
      icon: <UserIcon className="h-6 w-6" />,
      iconSolid: <UserIconSolid className="h-6 w-6" />,
      path: "/account",
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50"
    },
  ];

  return (
      <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 sm:hidden"
      >
        {/* Glassmorphism Background */}
        <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl">
          {/* Gradient Top Border */}
          <div className="h-1 bg-gradient-to-r from-pink-500 via-blue-500 via-green-500 via-yellow-500 to-purple-500"></div>

          <div className="flex justify-around items-center py-3 px-2">
            {navItems.map((item, index) => {
              const isActive = pathname === item.path;

              return (
                  <Link
                      key={item.name}
                      to={item.path}
                      className="relative flex flex-col items-center group"
                  >
                    {/* Active Indicator Background */}
                    <AnimatePresence>
                      {isActive && (
                          <motion.div
                              layoutId="activeTab"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className={`absolute -inset-2 rounded-2xl ${item.bgColor} opacity-50`}
                          />
                      )}
                    </AnimatePresence>

                    {/* Icon Container */}
                    <motion.div
                        whileTap={{ scale: 0.85 }}
                        className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${
                            isActive
                                ? `bg-gradient-to-br ${item.color} text-white shadow-lg`
                                : "text-gray-500 group-hover:text-gray-700 group-hover:bg-gray-50"
                        }`}
                    >
                      {/* Icon with smooth transition */}
                      <motion.div
                          animate={{
                            scale: isActive ? 1.1 : 1,
                            rotate: isActive ? [0, -10, 10, 0] : 0
                          }}
                          transition={{
                            scale: { type: "spring", stiffness: 300 },
                            rotate: { duration: 0.3 }
                          }}
                      >
                        {isActive ? item.iconSolid : item.icon}
                      </motion.div>

                      {/* Active Pulse Effect */}
                      {isActive && (
                          <motion.div
                              className={`absolute inset-0 rounded-xl bg-gradient-to-br ${item.color} opacity-30`}
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                          />
                      )}
                    </motion.div>

                    {/* Label */}
                    <motion.span
                        animate={{
                          scale: isActive ? 1.05 : 1,
                          fontWeight: isActive ? 600 : 400
                        }}
                        className={`text-xs mt-1 transition-colors duration-300 ${
                            isActive
                                ? "text-gray-800"
                                : "text-gray-500 group-hover:text-gray-700"
                        }`}
                    >
                      {item.name}
                    </motion.span>

                    {/* Active Dot Indicator */}
                    <AnimatePresence>
                      {isActive && (
                          <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className={`w-1 h-1 rounded-full bg-gradient-to-r ${item.color} mt-1`}
                          />
                      )}
                    </AnimatePresence>

                    {/* Ripple Effect on Tap */}
                    <motion.div
                        className="absolute inset-0 rounded-2xl"
                        whileTap={{
                          background: [
                            "rgba(0,0,0,0)",
                            "rgba(0,0,0,0.1)",
                            "rgba(0,0,0,0)"
                          ]
                        }}
                        transition={{ duration: 0.3 }}
                    />
                  </Link>
              );
            })}
          </div>

          {/* Bottom Safe Area */}
          <div className="h-safe-bottom bg-white/80"></div>
        </div>
      </motion.nav>
  );
};

export default EnhancedBottomNav;