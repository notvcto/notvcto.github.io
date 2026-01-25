import React, { useState, useEffect } from "react";
import ReactGA from "react-ga4";
import emailjs from "@emailjs/browser";

export const Gedit = () => {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [placeholders, setPlaceholders] = useState({
    name: "Your Email / Name :",
    subject: "subject (may be a feedback for this website!)",
    message: "Message",
  });

  useEffect(() => {
    emailjs.init("OrfJgp8SK9eKhq6oo");
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    // Map IDs to state keys
    const key =
      id === "sender-name"
        ? "name"
        : id === "sender-subject"
        ? "subject"
        : "message";

    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const closeWindow = () => {
    // Functional replacement for $("#close-gedit").trigger("click");
    if (typeof document !== "undefined") {
      const closeBtn = document.getElementById("close-gedit");
      if (closeBtn) closeBtn.click();
    }
  };

  const sendMessage = async () => {
    let { name, subject, message } = formData;
    name = name.trim();
    subject = subject.trim();
    message = message.trim();

    let hasError = false;
    let newPlaceholders = { ...placeholders };

    if (name.length === 0) {
      setFormData((prev) => ({ ...prev, name: "" }));
      newPlaceholders.name = "Name must not be Empty!";
      hasError = true;
    }

    if (message.length === 0) {
      setFormData((prev) => ({ ...prev, message: "" }));
      newPlaceholders.message = "Message must not be Empty!";
      hasError = true;
    }

    if (hasError) {
      setPlaceholders(newPlaceholders);
      return;
    }

    setSending(true);

    const serviceID = "service_mt3wq89";
    const templateID = "template_qkqomp3";
    const templateParams = {
      name: name,
      subject: subject,
      message: message,
    };

    try {
      await emailjs.send(serviceID, templateID, templateParams);
      setSending(false);
      closeWindow();
    } catch (error) {
      console.error("EmailJS Error:", error);
      setSending(false);
      // Original code also closed window on error
      closeWindow();
    }

    ReactGA.event({
      category: "Send Message",
      action: `${name}, ${subject}, ${message}`,
    });
  };

  return (
    <div className="w-full h-full relative flex flex-col bg-ub-cool-grey text-white select-none">
      <div className="flex items-center justify-between w-full bg-ub-gedit-light bg-opacity-60 border-b border-t border-blue-400 text-sm">
        <span className="font-bold ml-2">Send a Message to Me</span>
        <div className="flex">
          <div
            onClick={sendMessage}
            className="border border-black bg-black bg-opacity-50 px-3 py-0.5 my-1 mx-1 rounded hover:bg-opacity-80 cursor-pointer"
          >
            Send
          </div>
        </div>
      </div>
      <div className="relative flex-grow flex flex-col bg-ub-gedit-dark font-normal windowMainScreen">
        <div className="absolute left-0 top-0 h-full px-2 bg-ub-gedit-darker"></div>
        <div className="relative">
          <input
            id="sender-name"
            className=" w-full text-ubt-gedit-orange focus:bg-ub-gedit-light outline-none font-medium text-sm pl-6 py-0.5 bg-transparent"
            placeholder={placeholders.name}
            spellCheck="false"
            autoComplete="off"
            type="text"
            value={formData.name}
            onChange={handleChange}
          />
          <span className="absolute left-1 top-1/2 transform -translate-y-1/2 font-bold light text-sm text-ubt-gedit-blue">
            1
          </span>
        </div>
        <div className="relative">
          <input
            id="sender-subject"
            className=" w-full my-1 text-ubt-gedit-blue focus:bg-ub-gedit-light gedit-subject outline-none text-sm font-normal pl-6 py-0.5 bg-transparent"
            placeholder={placeholders.subject}
            spellCheck="false"
            autoComplete="off"
            type="text"
            value={formData.subject}
            onChange={handleChange}
          />
          <span className="absolute left-1 top-1/2 transform -translate-y-1/2 font-bold  text-sm text-ubt-gedit-blue">
            2
          </span>
        </div>
        <div className="relative flex-grow">
          <textarea
            id="sender-message"
            className=" w-full gedit-message font-light text-sm resize-none h-full windowMainScreen outline-none tracking-wider pl-6 py-1 bg-transparent"
            placeholder={placeholders.message}
            spellCheck="false"
            autoComplete="none"
            type="text"
            value={formData.message}
            onChange={handleChange}
          />
          <span className="absolute left-1 top-1 font-bold  text-sm text-ubt-gedit-blue">
            3
          </span>
        </div>
      </div>
      {sending ? (
        <div className="flex justify-center items-center animate-pulse h-full w-full bg-gray-400 bg-opacity-30 absolute top-0 left-0">
          <img
            className={" w-8 absolute animate-spin"}
            src="./themes/Yaru/status/process-working-symbolic.svg"
            alt="Ubuntu Process Symbol"
          />
        </div>
      ) : null}
    </div>
  );
};

export const displayGedit = () => {
  return <Gedit> </Gedit>;
};

export default Gedit;
