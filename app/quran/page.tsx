import { GetSurahs } from "./actions";
import SurahsComponent from "./components/surahs-component";
import RootHeader from "./components/root-header";
import SomethingWentWrong from "./components/something-went-wrong";
import { Separator } from "@/components/ui/separator";

export default async function QuranPage() {
  try {
    const result = await GetSurahs();

    if (result.error || !result.data) return <SomethingWentWrong />;

    return (
      <main
        dir="rtl"
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-28 pb-16 font-cairo"
      >
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-green-200/20 dark:from-emerald-900/10 dark:to-green-900/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-teal-200/20 to-emerald-200/20 dark:from-teal-900/10 dark:to-emerald-900/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="space-y-8">
            <RootHeader />
            <Separator className="bg-slate-200 dark:bg-slate-700" />
            <SurahsComponent surahs={result.data} />
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error loading surahs:", error);
    return <SomethingWentWrong />;
  }
}
