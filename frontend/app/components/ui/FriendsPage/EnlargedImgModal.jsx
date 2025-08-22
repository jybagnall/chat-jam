export default function EnlargedImgModal({ imgSrc, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-50"
      onClick={onClose}
    >
      <p className="text-sm text-white opacity-80 mb-2">
        Image is closed when clicked.
      </p>
      <img
        src={imgSrc}
        alt="enlarged user image"
        className="max-w-[500px] max-h-[500px] rounded-lg"
      />
    </div>
  );
}
