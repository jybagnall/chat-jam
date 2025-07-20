export default function Toggle({ blockFriend, handleClick }) {
  return (
    <div className="group relative inline-flex w-11 shrink-0 rounded-full bg-gray-200 p-0.5 inset-ring inset-ring-gray-900/5 outline-offset-2 outline-orange-600 transition-colors duration-200 ease-in-out has-checked:bg-orange-600 has-focus-visible:outline-2 dark:bg-white/5 dark:inset-ring-white/10 dark:outline-orange-500 dark:has-checked:bg-orange-500">
      <span className="size-4 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-5" />
      <input
        type="checkbox"
        checked={blockFriend}
        onChange={handleClick}
        aria-label="Toggle to block this user"
        className="absolute inset-0 appearance-none focus:outline-hidden"
      />
    </div>
  );
}
