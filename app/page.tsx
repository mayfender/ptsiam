import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const menus = [
    { name: "คัดข้อมูลที่ดิน", href: "ui/poss-right" },
    { name: "N...", href: "/" },
    { name: "N...", href: "/" },
    { name: "N...", href: "/" },
  ];
  return (
    <div className="px-20">
      <div className="mt-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 grow">PT Siam</h1>
      </div>
      <div className="p-4 text-center divide-y divide-gray-500">
        {menus.map((item: any, index: any) => (
          <div key={index} className="flex h-10 items-center">
            <div className="w-20">{index + 1}.</div>
            <div className="grow text-left">
              <Link href={item.href}>{item.name}</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
