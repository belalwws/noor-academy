import {
  SurahsType,
  SurahType,
  TafseerKurdishType,
  TafseerListType,
  TafseerType,
} from "../types";

export const GetSurahs = async () => {
  try {
    const response = await fetch("https://api.alquran.cloud/v1/surah");

    if (response.status !== 200) {
      return { status: response.status, error: "Not Found", data: null };
    }

    const { data } = (await response.json()) as SurahsType;

    return {
      status: response.status,
      data,
      error: null,
      success: "Data fetched successfully",
    };
  } catch (error) {
    console.error("GetSurahs error:", error);
    return { status: 500, error: "Internal Server Error", data: null };
  }
};

export const GetSurah = async ({ surahNumber }: { surahNumber: number }) => {
  try {
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`
    );

    if (response.status !== 200) {
      return { status: response.status, error: "Not Found", data: null };
    }

    const { data } = (await response.json()) as SurahType;

    return {
      status: response.status,
      data,
      error: null,
      success: "Data fetched successfully",
    };
  } catch (error) {
    console.error("GetSurah error:", error);
    return { status: 500, error: "Internal Server Error", data: null };
  }
};

export const GetTafseerList = async () => {
  try {
    // استخدام قائمة ثابتة من التفاسير المتاحة من API alquran.cloud
    const tafseerList = [
      { id: 169, name: "تفسير الجلالين" },
      { id: 171, name: "تفسير السعدي" },
      { id: 164, name: "تفسير ابن كثير" },
      { id: 168, name: "تفسير القرطبي" },
      { id: 167, name: "تفسير الطبري" },
      { id: 170, name: "تفسير البغوي" },
    ];

    return {
      status: 200,
      data: tafseerList,
      error: null,
      success: "Data fetched successfully",
    };
  } catch (error) {
    console.error("GetTafseerList error:", error);
    return { status: 500, error: "Internal Server Error", data: null };
  }
};

export const GetTafseer = async ({
  surahNumber,
  ayahNumber,
  tafseerId,
}: {
  surahNumber: number;
  ayahNumber: number;
  tafseerId: number;
}): Promise<TafseerType> => {
  try {
    const response = await fetch(
      `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/editions/quran-simple,${tafseerId}`
    );

    if (response.status !== 200) {
      throw new Error("Failed to fetch tafseer");
    }

    const { data } = await response.json();
    
    return {
      tafseer_id: tafseerId,
      tafseer_name: data[1]?.edition?.name || "تفسير",
      ayah_url: "",
      ayah_number: ayahNumber,
      text: data[1]?.text || "لا يوجد تفسير متاح",
    };
  } catch (error) {
    console.error("Error fetching tafseer:", error);
    throw error;
  }
};

export const GetKurdishTafseer = async ({
  ayahNumber,
}: {
  ayahNumber: number;
}) => {
  try {
    const response = await fetch(
      `https://api.alquran.cloud/v1/ayah/${ayahNumber}/ku.asan`
    );

    if (response.status !== 200)
      return { status: response.status, error: "Not Found", data: null };

    const { data } = (await response.json()) as TafseerKurdishType;

    return {
      status: response.status,
      data,
      error: null,
      success: "Data fetched successfully",
    };
  } catch (error) {
    console.error("GetKurdishTafseer error:", error);
    return { status: 500, error: "Internal Server Error", data: null };
  }
};
