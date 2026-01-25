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
    name: "Your Email / Name",
    subject: "Subject (may be a feedback for this website!)",
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
      <div className="flex-grow flex flex-col p-4 gap-4 overflow-y-auto windowMainScreen">
        <div className="flex flex-col gap-1">
          <label htmlFor="sender-name" className="text-sm font-medium text-gray-300">
            Name / Email
          </label>
          <input
            id="sender-name"
            className="w-full p-2 rounded bg-ub-grey border border-gray-600 focus:border-ub-orange focus:outline-none text-white text-sm"
            placeholder={placeholders.name}
            spellCheck="false"
            autoComplete="off"
            type="text"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="sender-subject" className="text-sm font-medium text-gray-300">
            Subject
          </label>
          <input
            id="sender-subject"
            className="w-full p-2 rounded bg-ub-grey border border-gray-600 focus:border-ub-orange focus:outline-none text-white text-sm"
            placeholder={placeholders.subject}
            spellCheck="false"
            autoComplete="off"
            type="text"
            value={formData.subject}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-1 flex-grow">
          <label htmlFor="sender-message" className="text-sm font-medium text-gray-300">
            Message
          </label>
          <textarea
            id="sender-message"
            className="w-full p-2 rounded bg-ub-grey border border-gray-600 focus:border-ub-orange focus:outline-none text-white text-sm flex-grow resize-none"
            placeholder={placeholders.message}
            spellCheck="false"
            autoComplete="none"
            type="text"
            value={formData.message}
            onChange={handleChange}
          />
        </div>
        <div className="w-full flex justify-end">
          <button
            onClick={sendMessage}
            className="bg-ub-orange text-white px-4 py-2 rounded font-bold hover:bg-red-600 transition-colors text-sm"
          >
            Send Message
          </button>
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
