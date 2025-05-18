import {
  FaFacebookF,
  FaEnvelope,
  FaWhatsapp,
  FaInstagram,
  FaLink,
} from "react-icons/fa";

const ShareButtons = ({ title }) => {
  const url = window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert("🔗 Link copied to clipboard!");
    } catch {
      alert("❌ Unable to copy.");
    }
  };

  return (
    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4 mb-6">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm whitespace-nowrap transition"
      >
        <FaLink /> Copy Link
      </button>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded-full text-sm whitespace-nowrap transition"
      >
        <FaFacebookF /> Facebook
      </a>

      <a
        href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}
        className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 rounded-full text-sm whitespace-nowrap transition"
      >
        <FaEnvelope /> Email
      </a>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 rounded-full text-sm whitespace-nowrap transition"
      >
        <FaWhatsapp /> WhatsApp
      </a>

      <a
        href="https://www.instagram.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 px-3 py-1.5 bg-pink-100 hover:bg-pink-200 rounded-full text-sm whitespace-nowrap transition"
      >
        <FaInstagram /> Instagram
      </a>
    </div>
  );
};

export default ShareButtons;
