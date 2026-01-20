import Image from "next/image";
interface UserTypeCardProps {
  icon: string;
  title: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
}

export function UserTypeCard({
  icon,
  title,
  description,
  isSelected,
  onClick
}: UserTypeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-2xl border text-left transition-all ${
        isSelected
          ? "border-primary-400 bg-bg-sidebar hover:bg-bg-sidebar/80 hover:shadow-sm transition-all duration-300"
          : "border-gray-200  hover:border-primary-400 hover:shadow-sm transition-all duration-300"
      }`}
    >
      <div className="flex items-center gap-4">
        <Image src={icon} alt={title} />
        <div className="flex-1">
          <h3
            className={`text-base font-semibold ${
              isSelected ? "text-body-heading-300" : "text-body-heading-200"
            }`}
          >
            {title}
          </h3>
          {description && (
            <p className="text-body-text-100 text-sm leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
