import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const menus = [
    { name: "คัดข้อมูลที่ดิน", href: "ui/poss-right" },
    { name: "AAAAA", href: "ui/poss-right" },
  ];
  return (
    <div className="border border-red-300 p-4 text-center">
      {menus.map((item: any, index: any) => (
        <div key={index}>
          <Link href={item.href}>
            {index + 1}. {item.name}
          </Link>
        </div>
      ))}
    </div>
  );
}
