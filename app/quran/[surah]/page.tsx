import { GetSurah, GetTafseerList } from "../actions";
import { notFound } from "next/navigation";
import SomethingWentWrong from "../components/something-went-wrong";
import SurahComponent from "../components/surah-component";

interface SurahPageProps {
  params: {
    surah: string;
  };
}

export default async function SurahPage({ params }: SurahPageProps) {
  const surahNumber = parseInt(params.surah);

  if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    notFound();
  }

  try {
    const [surahResult, tafseerListResult] = await Promise.all([
      GetSurah({ surahNumber }),
      GetTafseerList(),
    ]);

    if (surahResult.error || !surahResult.data || tafseerListResult.error || !tafseerListResult.data) {
      return <SomethingWentWrong />;
    }

    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <SurahComponent surah={surahResult.data} TafseerList={tafseerListResult.data} />
      </div>
    );
  } catch (error) {
    console.error("Error loading surah:", error);
    return <SomethingWentWrong />;
  }
}
