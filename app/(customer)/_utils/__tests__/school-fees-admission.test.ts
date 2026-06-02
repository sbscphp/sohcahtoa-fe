import {
  mapApiAdmissionTypeToUi,
  mapUiAdmissionTypeToApi,
  requiresUndergraduateStyleDocuments,
  SCHOOL_FEES_ADMISSION_UI,
} from "../school-fees-admission";

describe("school-fees-admission", () => {
  it("maps UI labels to API enums", () => {
    expect(mapUiAdmissionTypeToApi(SCHOOL_FEES_ADMISSION_UI.UNDERGRADUATE)).toBe("UNDERGRADUATE");
    expect(mapUiAdmissionTypeToApi(SCHOOL_FEES_ADMISSION_UI.POSTGRADUATE)).toBe("POSTGRADUATE");
    expect(mapUiAdmissionTypeToApi(SCHOOL_FEES_ADMISSION_UI.OTHER)).toBe("OTHER");
  });

  it("maps API enums to UI labels", () => {
    expect(mapApiAdmissionTypeToUi("UNDERGRADUATE")).toBe(SCHOOL_FEES_ADMISSION_UI.UNDERGRADUATE);
    expect(mapApiAdmissionTypeToUi("POSTGRADUATE")).toBe(SCHOOL_FEES_ADMISSION_UI.POSTGRADUATE);
    expect(mapApiAdmissionTypeToUi("OTHER")).toBe(SCHOOL_FEES_ADMISSION_UI.OTHER);
  });

  it("treats Other as undergraduate-style documents", () => {
    expect(requiresUndergraduateStyleDocuments(SCHOOL_FEES_ADMISSION_UI.UNDERGRADUATE)).toBe(true);
    expect(requiresUndergraduateStyleDocuments(SCHOOL_FEES_ADMISSION_UI.OTHER)).toBe(true);
    expect(requiresUndergraduateStyleDocuments(SCHOOL_FEES_ADMISSION_UI.POSTGRADUATE)).toBe(false);
  });
});
