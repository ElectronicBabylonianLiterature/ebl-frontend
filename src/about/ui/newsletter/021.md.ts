const newsletter = `
# eBL Newsletter 21

## 10 February 2026

### Library

-	Proper names: We now have rules for normalising names in cuneiform texts, see
  [generic-documentation/guides/properNames.md at master · ElectronicBabylonianLiterature/generic-documentation](https://github.com/ElectronicBabylonianLiterature/generic-documentation/blob/master/guides/properNames.md).
  Please bear this in mind when translating and soon also when lemmatising and
  normalising entities.
- Script: Beyond “Early” and “Late”, also “Middle” can be used now as a period
  modifier.
- References: “Acquisition” and “Seal” have been added as new reference types.
  The latter should be used for discussions of seals and seal impressions,
  while photos and copies of seals should be referred to as “Photo” and “Copy”,
  respectively.
- The ATF Importer has been completely reimplemented. It is now possible to
  import ATF in different formats, including labelled translations and legacy
  ATF. For more details, see [GitHub - ElectronicBabylonianLiterature/ebl-api: Electronic Babylonian Literature API](https://github.com/ElectronicBabylonianLiterature/ebl-api?tab=readme-ov-file#importing-atf-files).
- The ngram-matcher can now be used with the editions OCRed from photos
  ([GitHub - ElectronicBabylonianLiterature/ngram-matcher](https://github.com/ElectronicBabylonianLiterature/ngram-matcher)).
- The eBL markup has been extended to support subscript (\`@sub{}\`),
  superscript (\`@sup{}\`), and bold (\`@b{}\`) text.
- New photos:
  - More than 5000 photos from the British Museum’s Babylonian (BM.14000–14999,
    BM.16000–17752) and Sippar Collections (BM.49487–52761) have been uploaded.
  - Another 600 new British Museum fragments have been imported (“Newly
    Registered Fragments Collection”): DT.521–532, K.23197–23683,
    Sp-III.836–938, 1932,1212.1501–1519 and 2025,6001.1–50. 
  - 650 photos from the Frau Professor Hilprecht Collection of Babylonian
    Antiquities in Jena, including those of the TMH 13 tablets and many
    previously unregistered fragments (HS.2470.A–2476.I, HS.2522–2536.Z,
    HS.2691–2698.B, HS.2714.D–2794), have been added. 
- New folios:
  - The acquisition registers of the Vorderasiatisches Museum’s tablet
    collection (VAT) have been indexed and uploaded as folios.
  - A collection of 12 unpublished copies by A.R. George has been uploaded
    (BM.50084, Si.741, Si.824, Si.861, K.15525, K.10953, K.11887, K.14483,
    K.19236, K.9687, Ist-A.135.A, Ist-A.135.B).
- New genres within Mathematical Astronomy and Mathematics, thanks to M.
  Ossendrijver. Mathematical Astronomy: Procedure Texts, Tables (Synodic
  Tables, Auxiliary Tables, Daily Motion Tables, Template Tables). Mathematics:
  Problem Texts, Lists (Coefficient Lists, Metrological Lists), Tables
  (Metrological Tables, Multiplication Tables, Tables of Reciprocals, Tables
  of Squares, Tables of Square Roots, Tables of Cubic Roots, Factorization
  Tables, Other Tables).
- eBL Evenings: We will be hosting Zoom sessions to showcase eBL’s features and
  tools. These sessions will include a Q&A – please feel free to submit
  questions in advance via [e-mail](mailto:ebl-info@culture.lmu.de). The next
  session is scheduled for March 13th at 5:00 PM CET. If you would like to
  attend, please register at the
  [link](https://lmu-munich.zoom-x.de/meeting/register/J08aK6HvSTSoZ5gKJqZZ4A).`

export default newsletter
