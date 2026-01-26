import React, { useState, useEffect, useRef } from "react";
// @ts-ignore
import Clock from "../util components/clock";
// @ts-ignore
import Status from "../util components/status";
// @ts-ignore
import StatusCard from "../util components/status_card";
import NotificationPanel from "./notification_panel";

interface NavbarProps {
  shutDown?: () => void;
  lockScreen?: () => void;
}

export default function Navbar({ shutDown, lockScreen }: NavbarProps) {
  const [showStatusCard, setShowStatusCard] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Animation state
  const [renderNotifications, setRenderNotifications] = useState(false);
  const [isClosingNotifications, setIsClosingNotifications] = useState(false);

  // Refs for click outside detection
  const notificationWrapperRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle Notification Panel click outside
      if (
        showNotifications &&
        notificationWrapperRef.current &&
        !notificationWrapperRef.current.contains(event.target as Node) &&
        clockRef.current &&
        !clockRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }

      // Handle Status Card click outside - handled by react-onclickoutside internally usually,
      // but if we want to be explicit we can do it here too.
      // However, StatusCard uses a library so let's trust it for now or implement logic if needed.
      // The original code used onFocus on the wrapper to show it.
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // Handle animation logic
  useEffect(() => {
      if (showNotifications) {
          setRenderNotifications(true);
          setIsClosingNotifications(false);
      } else if (renderNotifications) {
          setIsClosingNotifications(true);
      }
  }, [showNotifications, renderNotifications]);

  const handleAnimationEnd = () => {
      if (isClosingNotifications) {
          setRenderNotifications(false);
          setIsClosingNotifications(false);
      }
  };

  const toggleNotifications = () => {
    // If status card is open, close it?
    if (showStatusCard) setShowStatusCard(false);

    setShowNotifications(!showNotifications);
  };

  return (
    <div className="main-navbar-vp absolute top-0 right-0 w-screen h-8 shadow-sm flex flex-nowrap justify-between items-center bg-ub-grey text-ubt-grey text-sm select-none z-50 px-2">
      <div
        tabIndex={0}
        className={
          "pl-3 pr-3 outline-none transition duration-100 ease-in-out rounded-full hover:bg-white hover:bg-opacity-10 focus:bg-white focus:bg-opacity-10 active:bg-opacity-20 flex items-center h-6 my-1 mx-1 cursor-default"
        }
      >
        Activities
      </div>

      <div
        ref={clockRef}
        tabIndex={0}
        onMouseDown={toggleNotifications}
        className={`relative z-50 pl-3 pr-3 text-xs md:text-sm outline-none transition duration-100 ease-in-out rounded-full hover:bg-white hover:bg-opacity-10 focus:bg-white focus:bg-opacity-10 active:bg-opacity-20 flex items-center h-6 my-1 mx-1 cursor-pointer font-medium ${
          showNotifications ? 'bg-white bg-opacity-10' : ''
        }`}
      >
        <Clock />
      </div>

      {/* Notification Panel - Centered under the clock */}
      {renderNotifications && (
        <div
            ref={notificationWrapperRef}
            className={`absolute top-10 left-1/2 z-50 ${isClosingNotifications ? 'animate-panel-out' : 'animate-panel-in'}`}
            onAnimationEnd={handleAnimationEnd}
        >
          <NotificationPanel />
        </div>
      )}

      <div
        id="status-bar"
        tabIndex={0}
        onFocus={() => {
          setShowStatusCard(true);
          setShowNotifications(false); // Close notifications if status opens
        }}
        // onBlur logic is tricky because clicking inside the card triggers blur on the wrapper.
        // StatusCard uses react-onclickoutside so it handles closing itself.
        className={
          "relative pr-3 pl-3 outline-none transition duration-100 ease-in-out rounded-full hover:bg-white hover:bg-opacity-10 focus:bg-white focus:bg-opacity-10 active:bg-opacity-20 flex items-center h-6 my-1 mx-1 cursor-default"
        }
      >
        <Status />
        <StatusCard
          shutDown={shutDown}
          lockScreen={lockScreen}
          visible={showStatusCard}
          toggleVisible={() => {
            setShowStatusCard(false);
          }}
        />
      </div>
    </div>
  );
}
