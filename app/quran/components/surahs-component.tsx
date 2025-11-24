"use client";
import { motion } from "framer-motion";
import shape_1 from "../assets/shape-1.png";
import { useCurrentFont } from "@/lib/store/hooks/useQuran";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SurahsType } from "../types";
import { SearchIcon, XCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SurahsComponent({
  surahs,
}: {
  surahs: SurahsType["data"];
}) {
  const [surahsData, setSurahsData] = useState<SurahsType["data"]>(surahs);
  const [search, setSearch] = useState<string>("");
  const [font] = useCurrentFont();

  useEffect(() => {
    if (search) {
      setSurahsData(
        surahs.filter((surah) =>
          surah.name
            .replaceAll(/[\u064B-\u0652\u064E-\u0650\u0651\u0652\u06E1]/g, "")
            .replaceAll("ي", "ی")
            .replaceAll(/إ|أ|آ|ٱ/g, "ا")
            .includes(search)
        )
      );
    } else {
      setSurahsData(surahs);
    }
  }, [search, surahs]);

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative w-full md:max-w-lg"
      >
        <Input
          type="text"
          placeholder="البحث في السور..."
          className="pr-10 pl-12 py-3 rtl font-noto-kufi-arabic bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
        <Button
          className="absolute left-2 top-1/2 -translate-y-1/2 size-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
          variant={"ghost"}
          onClick={() => setSearch("")}
        >
          <XCircleIcon
            className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-opacity ${
              search ? "opacity-100" : "opacity-0"
            }`}
          />
        </Button>
        <SearchIcon
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 dark:text-blue-400"
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 rtl">
        {surahsData &&
          surahsData.map((surah, index) => (
            <motion.div
              key={surah.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link href={`/quran/${surah.number}`}>
                <Card
                  className="hover:shadow-2xl hover:scale-105 transition-all duration-300 relative h-[100px] overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group"
                >
                  <Image
                    quality={100}
                    src={shape_1}
                    alt={surah.name}
                    width={500}
                    height={500}
                    className="absolute left-0 top-0 w-[120px] h-[120px] opacity-10 dark:opacity-5 group-hover:opacity-20 dark:group-hover:opacity-10 transition-opacity"
                    loading="eager"
                  />
                  <CardHeader className="flex-row gap-2 items-center text-3xl rtl z-50">
                    <div className="flex gap-4 items-center text-2xl">
                      <Button
                        asChild
                        variant={"outline"}
                        size={"icon"}
                        className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
                      >
                        <p>{surah.number}</p>
                      </Button>
                      <p
                        className="mb-4 text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                        style={{
                          fontFamily: `var(--font-${font})`
                        }}
                      >
                        {surah.name}
                      </p>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
      </div>
    </div>
  );
}
