export interface ResourceLink {
  title: string
  url: string
  description?: string
}

export interface Textbook {
  name: string
  edition?: string
  chapters?: string
}

export interface SubjectResources {
  id: string
  name: string
  shortName: string
  youtubePlaylists: ResourceLink[]
  revisionPyqs: ResourceLink[]
  nptelLectures: ResourceLink[]
  textbooks: Textbook[]
  topicwisePyqs: ResourceLink[]
  freeTests: ResourceLink[]
  notes?: ResourceLink[]
  additional?: ResourceLink[]
}

export interface GeneralResources {
  fullLengthMocks: ResourceLink[]
  previousYearPapers: ResourceLink[]
  notes: ResourceLink[]
}

export const contributor = {
  name: 'Anjali (GATE AIR 13)',
  linkedin: 'https://www.linkedin.com/in/anjali-chauhan24/',
  youtube: 'https://www.youtube.com/@anjc24',
}

export const subjectResources: SubjectResources[] = [
  {
    id: 'os',
    name: 'Operating System',
    shortName: 'OS',
    youtubePlaylists: [
      { title: 'Full OS Playlist', url: 'https://youtube.com/playlist?list=PLG9aCp4uE-s17rFjWM8KchGlffXgOzzVP&si=ZMitdCTm8l32csO1' },
    ],
    revisionPyqs: [
      { title: 'Revision & PYQs Video Solutions', url: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHixlIaarIXGPy-eggJQMxd_&si=RYjiG6Ewmyszn0Mv' },
    ],
    nptelLectures: [
      { title: 'NPTEL OS Lectures', url: 'https://youtube.com/playlist?list=PLyqSpQzTE6M9SYI5RqwFYtFYab94gJpWk&si=zMmUw6nYg5o4ZG0A' },
    ],
    textbooks: [
      { name: 'Operating Systems by Avi Silberschatz, Greg Gagne, Peter Baer Galvin', edition: 'International 9E', chapters: 'ch 2.1-2.5, 3, 4.1-4.3, 4.6, 5.1-5.3, 6.1-6.10, 7, 8.1-8.6, 9.1-9.6, 9.9, 10, 11.1-11.5, 12.1-12.6' },
    ],
    topicwisePyqs: [
      { title: 'Topicwise PYQs (GitHub)', url: 'https://github.com/GATEOverflow/GO-PDFs/releases/tag/gatecse-2025' },
    ],
    freeTests: [
      { title: 'GO 2017 OS Test 1', url: 'https://gateoverflow.in/exam/32/go2017-os-1' },
      { title: 'GO 2017 OS Test 2', url: 'https://gateoverflow.in/exam/32/go2017-os-2' },
      { title: 'GO 2017 OS Test 3', url: 'https://gateoverflow.in/exam/32/go2017-os-3' },
      { title: 'OS GATE 2020 Previous GATE 2', url: 'https://gateoverflow.in/exam/148/operating-systems-gate2020-previous-gate-2' },
    ],
  },
  {
        id: 'coa',
    name: 'Computer Organization and Architecture',
    shortName: 'COA',
    youtubePlaylists:
     [
      { title: 'Full COA Playlist', url: 'https://youtube.com/playlist?list=PLG9aCp4uE-s0xddCBjwMDnEVyc523WbA2&si=MhOhWHFeKSPLCc3D' },
    ],
    revisionPyqs: [
      { title: 'Revision & PYQs Video Solutions', url: 'https://youtube.com/playlist?list=PLG9aCp4uE-s2qCKKu2XD3zDK-NFEvE91n&si=3F_wVgi9yxcNRAGM' },
    ],
    nptelLectures: [
      { title: 'NPTEL COA Lectures', url: 'https://youtube.com/playlist?list=PLgHucKw979AvcnTpPNZMZyORdL5HvTr9m&si=45QV0I_l38BhQs8l' },
      { title: 'NPTEL COA (Alternate)', url: 'https://youtube.com/playlist?list=PL2F82ECDF8BB71B0C&si=odaLSm9J4S9SPlJf' },
    ],
    textbooks: [
      { name: 'Computer Organisation by Carl Hamacher', chapters: 'ch 1.6, 2.1-2.5, 2.9, 2.10, 4.1-4.2, 4.4-4.6, 5.1-5.2, 5.4-5.8, 5.9.1, 6.1-6.4, 6.7.1, 7, 8.1-8.5, 8.8' },
      { name: 'Computer Organization and Design: the Hardware/Software Interface by David A Patterson and John L. Hennessy', edition: '5E', chapters: '1, 2, 4.1-4.9, 4.14, 5.1-5.10' },
    ],
    topicwisePyqs: [
      { title: 'Topicwise PYQs (GitHub)', url: 'https://github.com/GATEOverflow/GO-PDFs/releases/tag/gatecse-2025' },
    ],
    freeTests: [
      { title: 'Computer Architecture Test 1', url: 'https://gateoverflow.in/exam/46/computer-architecture' },
      { title: 'Computer Architecture Test 2', url: 'https://gateoverflow.in/exam/83/computer-architecture-2' },
      { title: 'CO & Architecture GATE 2020 Previous 1', url: 'https://gateoverflow.in/exam/153/co-and-architecture-gate2020-previous-gate-1' },
      { title: 'CO & Architecture GATE 2020 Previous 2', url: 'https://gateoverflow.in/exam/154/co-and-architecture-gate2020-previous-gate-2' },
      { title: 'CO & Architecture GATE 2020 Previous 3', url: 'https://gateoverflow.in/exam/168/co-and-architecture-gate2020-previous-gate-3' },
      { title: 'CO & Architecture GATE 2020 Previous 4', url: 'https://gateoverflow.in/exam/169/co-and-architecture-gate2020-previous-gate-4' },
    ],
  },
  {
        id: 'cn',
    name: 'Computer Network',
    shortName: 'CN',
    youtubePlaylists:
     [
      { title: 'Full CN Playlist', url: 'https://youtube.com/playlist?list=PLC36xJgs4dxHT-TxTy3U1slr5RaBJGaLd&si=2NKdNOM8SCj7GV7m' },
    ],
    revisionPyqs: [
      { title: 'Revision & PYQs Video Solutions', url: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHim3NUSNOb7ffyhaE5MSkmE&si=K_BGtR_91PzzpPRK' },
    ],
    nptelLectures: [
      { title: 'NPTEL CN Lectures', url: 'https://youtube.com/playlist?list=PLbRMhDVUMngf-peFloB7kyiA40EptH1up&si=DrRWF-OoBVLFpV4b' },
    ],
    textbooks: [
      { name: 'Data Communications and Networking by Behrouz A. Forouzan', edition: '5E', chapters: '1.1-1.3, 2, 3.6, 8-10, 11.1-2, 12, 13.1-13.2, 17.1, 18-19.2, 20-21.2, 23-24.3, 25.1-25.2, 26' },
    ],
    topicwisePyqs: [
      { title: 'Topicwise PYQs (GitHub)', url: 'https://github.com/GATEOverflow/GO-PDFs/releases/tag/gatecse-2025' },
    ],
    freeTests: [
      { title: 'CN Test', url: 'https://gateoverflow.in/exam/49/computer-networks' },
      { title: 'CN GATE 2020 Previous 1', url: 'https://gateoverflow.in/exam/143/computer-networks-gate2020-previous-gate-1' },
      { title: 'CN GATE 2020 Previous 2', url: 'https://gateoverflow.in/exam/144/computer-networks-gate2020-previous-gate-2' },
    ],
    additional: [
      { title: 'CN Videos by Jim Kurose (YouTube)', url: 'https://www.youtube.com/@JimKurose/videos' },
    ],
  },
  {
    id: 'cd',
    name: 'Compiler Design',
    shortName: 'CD',
    youtubePlaylists: [
      { title: 'Compiler Design Playlist 1', url: 'https://youtube.com/playlist?list=PLEbnTDJUr_IcPtUXFy2b1sGRPsLFMghhS&si=9gh9zkll_uPxONSj' },
      { title: 'Compiler Design Playlist 2', url: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHj8kDhh1OCIzEha8qhzfe1f&si=3N0fjYSTe5c7nM5u' },
    ],
    revisionPyqs: [
      { title: 'Revision & PYQs Video Solutions', url: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHjy3eH_qRImIs5dVUTpr9ga&si=5qmgBYDkFhvkZgZH' },
    ],
    nptelLectures: [
      { title: 'NPTEL CD Lectures', url: 'https://youtube.com/playlist?list=PL54i8TI-dREaHgsBFNalWnz-bC9CZkOBb&si=G65o3fHjR549Y2OJ' },
    ],
    textbooks: [
      { name: 'Compilers: Principles, Techniques & Tools by Ravi Sethi, Alfred V. Aho, Monica S. Lam, D. Jeffrey Ulman' },
    ],
    topicwisePyqs: [
      { title: 'Topicwise PYQs (GitHub)', url: 'https://github.com/GATEOverflow/GO-PDFs/releases/tag/gatecse-2025' },
    ],
    freeTests: [
      { title: 'GO 2019 Compiler 1 - Parsing', url: 'https://gateoverflow.in/exam/139/go2019-compiler1-parsing' },
      { title: 'Compiler Design Test', url: 'https://gateoverflow.in/exam/47/compiler-design' },
      { title: 'Compilers GATE 2020 Previous 1', url: 'https://gateoverflow.in/exam/151/compilers-gate2020-previous-gate-1' },
      { title: 'Compilers GATE 2020 Previous 2', url: 'https://gateoverflow.in/exam/152/compilers-gate2020-previous-gate-2' },
      { title: 'Compilers GATE 2020 Previous 3', url: 'https://gateoverflow.in/exam/167/compilers-gate2020-previous-gate-3' },
    ],
    additional: [
      { title: 'Compilers Course by Prof. Alex Aiken (Stanford / edX)', url: 'https://www.edx.org/learn/computer-science/stanford-university-compilers' },
    ],
  },
  {
    id: 'toc',
    name: 'Theory of Computation',
    shortName: 'TOC',
    youtubePlaylists: [
      { title: 'Full TOC Playlist', url: 'https://youtube.com/playlist?list=PLC36xJgs4dxGvebewU4z2CZYo-8nB93E7&si=iKAopfWszFTAf1eL' },
    ],
    revisionPyqs: [
      { title: 'Revision & PYQs Video Solutions', url: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHhXeEdbXsi34ePvUjL8I-Q9&si=xymd0FQXQQYK6idE' },
    ],
    nptelLectures: [
      { title: 'NPTEL TOC Lectures', url: 'https://youtube.com/playlist?list=PLbRMhDVUMngcwWkzVTm_kFH6JW4JCtAUM&si=Vzf6zkHe9Ly7_NXi' },
    ],
    textbooks: [
      { name: 'An Introduction to Formal Languages and Automata by Peter Linz', edition: '6E', chapters: 'ch 1.2, 1.3, 2-12, Appendix-A' },
    ],
    topicwisePyqs: [
      { title: 'Topicwise PYQs (GitHub)', url: 'https://github.com/GATEOverflow/GO-PDFs/releases/tag/gatecse-2025' },
    ],
    freeTests: [
      { title: 'TOC Test 1', url: 'https://gateoverflow.in/exam/48/theory-of-computation' },
      { title: 'TOC Test 2', url: 'https://gateoverflow.in/exam/84/theory-of-computation-test-2' },
      { title: 'TOC Previous GATE 1', url: 'https://gateoverflow.in/exam/86/theory-of-computation-previous-gate-1' },
      { title: 'TOC GATE 2020 Previous 1', url: 'https://gateoverflow.in/exam/149/theory-of-computation-gate2020-previous-gate-1' },
      { title: 'TOC GATE 2020 Previous 2', url: 'https://gateoverflow.in/exam/150/theory-of-computation-gate2020-previous-gate-2' },
      { title: 'TOC GATE 2020 Previous 3', url: 'https://gateoverflow.in/exam/170/theory-of-computation-gate2020-previous-gate-3' },
      { title: 'TOC GATE 2020 Previous 4', url: 'https://gateoverflow.in/exam/171/theory-of-computation-gate2020-previous-gate-4' },
    ],
  },
  {
    id: 'c',
    name: 'C-Programming',
    shortName: 'C',
    youtubePlaylists: [
      { title: 'Full C Programming Playlist', url: 'https://youtube.com/playlist?list=PLbE3-5DBkMUkATaUFgDIpBDbfnym0qvsQ&si=tLgWVRmDfwlMCbvj' },
    ],
    revisionPyqs: [],
    nptelLectures: [
      { title: 'NPTEL C Programming', url: 'https://youtube.com/playlist?list=PLEAYkSg4uSQ2k6GwNhpgSHodGT8wfvgwu&si=3Yo1XGiLn7ZURbpm' },
    ],
    textbooks: [
      { name: 'The C Programming Language by Brian Kernighan and Dennis Ritchie', edition: '2E', chapters: 'ch 1-8' },
    ],
    topicwisePyqs: [
      { title: 'Topicwise PYQs (GitHub)', url: 'https://github.com/GATEOverflow/GO-PDFs/releases/tag/gatecse-2025' },
    ],
    freeTests: [
      { title: 'GO 2017 Programming 1', url: 'https://gateoverflow.in/exam/39/go2017-programming-1' },
      { title: 'Programming Test 2', url: 'https://gateoverflow.in/exam/80/go_programming-test-2' },
      { title: 'Programming GATE 2020 Previous 1', url: 'https://gateoverflow.in/exam/181/programming-gate2020-previous-gate-1' },
      { title: 'Programming GATE 2020 Previous 2', url: 'https://gateoverflow.in/exam/182/programming-gate2020-previous-gate-2' },
    ],
  },
  {
    id: 'ds',
    name: 'Data Structures',
    shortName: 'DS',
    youtubePlaylists: [
      { title: 'Full DS Playlist', url: 'https://youtube.com/playlist?list=PLIC0AxWOdm5BvHpI_AtPqqjoADnSqcYgp&si=q_Qps7uYmU2RjuLr' },
    ],
    revisionPyqs: [
      { title: 'Revision & PYQs Video Solutions', url: 'https://youtube.com/playlist?list=PLG9aCp4uE-s3Rs4AjzG0VcXQCggmOJJ6W&si=YgSf-sgQNlmT2tBd' },
    ],
    nptelLectures: [
      { title: 'NPTEL DS Lectures', url: 'https://youtube.com/playlist?list=PLBF3763AF2E1C572F&si=oiRSnIiN4ntMIPQL' },
    ],
    textbooks: [
      { name: 'Data Structures And Algorithms by Narasimha Karumanchi' },
    ],
    topicwisePyqs: [
      { title: 'Topicwise PYQs (GitHub)', url: 'https://github.com/GATEOverflow/GO-PDFs/releases/tag/gatecse-2025' },
    ],
    freeTests: [
      { title: 'Data Structure Set 2', url: 'https://gateoverflow.in/exam/52/data-structure-set-2' },
      { title: 'Data Structures GATE 2020 Previous 1', url: 'https://gateoverflow.in/exam/177/data-structures-gate2020-previous-gate-1' },
      { title: 'Data Structures GATE 2020 Previous 2', url: 'https://gateoverflow.in/exam/178/data-structures-gate2020-previous-gate-2' },
      { title: 'Data Structures GATE 2020 Previous 3', url: 'https://gateoverflow.in/exam/179/data-structures-gate2020-previous-gate-3' },
      { title: 'Data Structures GATE 2020 Previous 4', url: 'https://gateoverflow.in/exam/180/data-structures-gate2020-previous-gate-4' },
    ],
  },
  {
        id: 'algo',
    name: 'Algorithms',
    shortName: 'Algo.',
    youtubePlaylists:

     [
      { title: 'Full Algorithms Playlist', url: 'https://youtube.com/playlist?list=PLAXnLdrLnQpRcveZTtD644gM9uzYqJCwr&si=U_A4tdPO33X3xV8I' },
    ],
    revisionPyqs: [
      { title: 'Revision & PYQs Video Solutions', url: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHjUCHdJp-_soSSmhgmO4i0T&si=5LN5dM51DjRDMOJ1' },
    ],
    nptelLectures: [
      { title: 'NPTEL Algorithms Lectures', url: 'https://youtube.com/playlist?list=PL7DC83C6B3312DF1E&si=pme4ZTL1jou81mt4' },
    ],
    textbooks: [
      { name: 'Introduction to Algorithms by CLRS', edition: '3E', chapters: 'ch 1-4, 6-9, 10, 11.1-11.4, 12.1-21.3, 15, 16.1-16.3, 17, 21-25.2' },
      { name: 'Algorithm Design by Jon Kleinberg and Éva Tardos', chapters: 'ch 1-6' },
    ],
    topicwisePyqs: [
      { title: 'Topicwise PYQs (GitHub)', url: 'https://github.com/GATEOverflow/GO-PDFs/releases/tag/gatecse-2025' },
    ],
    freeTests: [
      { title: 'GO 2017 Algorithms 1', url: 'https://gateoverflow.in/exam/37/go2017-algorithms-1' },
      { title: 'Algorithm Test 2', url: 'https://gateoverflow.in/exam/82/algorithm-test-2' },
      { title: 'Algorithms Previous GATE 1', url: 'https://gateoverflow.in/exam/66/algorithms-previous-gate-1' },
      { title: 'Algorithms GATE 2020 Previous 1', url: 'https://gateoverflow.in/exam/145/algorithms-gate2020-previous-gate-1' },
      { title: 'Algorithms GATE 2020 Previous 2', url: 'https://gateoverflow.in/exam/146/algorithms-gate2020-previous-gate-2' },
    ],
  },
  {
    id: 'dl',
    name: 'Digital Logic',
    shortName: 'DL',
    youtubePlaylists: [
      { title: 'Full Digital Logic Playlist', url: 'https://youtube.com/playlist?list=PLBlnK6fEyqRjMH3mWf6kwqiTbT798eAOm&si=4C0Z9de3YKT4zHeb' },
    ],
    revisionPyqs: [
      { title: 'Revision & PYQs Video Solution', url: 'https://www.youtube.com/live/h-SDoV0_pwQ?si=PmwmIQ__UHWvUorW' },
    ],
    nptelLectures: [
      { title: 'NPTEL Digital Logic', url: 'https://youtube.com/playlist?list=PL803563859BF7ED8C&si=OXD8r2PBFbS6gbcC' },
    ],
    textbooks: [
      { name: 'Digital Logic and Computer Design by M. Morris Mano', chapters: '1.1-1.8, 2.1-2.7, 3-7' },
    ],
    topicwisePyqs: [
      { title: 'Topicwise PYQs (GitHub)', url: 'https://github.com/GATEOverflow/GO-PDFs/releases/tag/gatecse-2025' },
    ],
    freeTests: [
      { title: 'GO 2017 Digital 1', url: 'https://gateoverflow.in/exam/33/go2017-digital-1' },
      { title: 'Digital Design Set 2', url: 'https://gateoverflow.in/exam/51/digital-design-set-2' },
      { title: 'Digital Logic GATE 2020 Previous 1', url: 'https://gateoverflow.in/exam/157/digital-logic-gate2020-previous-gate-1' },
      { title: 'Digital Logic GATE 2020 Previous 2', url: 'https://gateoverflow.in/exam/158/digital-logic-gate2020-previous-gate-2' },
      { title: 'Digital Logic GATE 2020 Previous 3', url: 'https://gateoverflow.in/exam/174/digital-logic-gate2020-previous-gate-3' },
      { title: 'Digital Logic GATE 2020 Previous 4', url: 'https://gateoverflow.in/exam/175/digital-logic-gate2020-previous-gate-4' },
    ],
  },
  {
    id: 'dbms',
    name: 'Database Management System',
    shortName: 'DBMS',
    youtubePlaylists: [
      { title: 'Full DBMS Playlist', url: 'https://youtube.com/playlist?list=PLG9aCp4uE-s0bu-I8fgDXXhVLO4qVROGy&si=5Iies1OyzDGms31i' },
    ],
    revisionPyqs: [
      { title: 'Revision & PYQs Video Solutions', url: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHh3otU-TnAK-GkqrvvOO33C&si=8Kazn74m30yhUDvh' },
    ],
    nptelLectures: [
      { title: 'NPTEL DBMS Lectures', url: 'https://youtube.com/playlist?list=PL-wVMhlYPDDkRQ0XrQ8IuslSiAWPpSfuJ&si=wEyZRgIxdNZgyqXE' },
    ],
    textbooks: [
      { name: 'Fundamentals of Database Systems by Ramez Elmasri and Shamkant B. Navathe', edition: '7E', chapters: 'ch 1.3-1.6, 2.1-2.3, 3, 5-8, 9.1, 14.1-14.5, 14.6-14.7(overview), 15.1-15.4, 16.1-16.7, 17.1-17.6, 20.1-20.5, 21.1-21.4, 21.7' },
    ],
    topicwisePyqs: [
      { title: 'Topicwise PYQs (GitHub)', url: 'https://github.com/GATEOverflow/GO-PDFs/releases/tag/gatecse-2025' },
    ],
    freeTests: [
      { title: 'Database Systems Test', url: 'https://gateoverflow.in/exam/50/database-systems' },
      { title: 'DBMS Subject Test 2', url: 'https://gateoverflow.in/exam/85/dbms-subject-test-2' },
      { title: 'Databases GATE 2020 Previous 1', url: 'https://gateoverflow.in/exam/155/databases-gate2020-previous-gate-1' },
      { title: 'Databases GATE 2020 Previous 2', url: 'https://gateoverflow.in/exam/156/databases-gate2020-previous-gate-2' },
      { title: 'Databases GATE 2020 Previous 3', url: 'https://gateoverflow.in/exam/172/databases-gate2020-previous-gate-3' },
      { title: 'Databases GATE 2020 Previous 4', url: 'https://gateoverflow.in/exam/173/databases-gate2020-previous-gate-4' },
    ],
  },
  {
    id: 'dm',
    name: 'Discrete Maths',
    shortName: 'DM',
    youtubePlaylists: [
      { title: 'Propositional Logic', url: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHillKxh1_iFeZhy9MftHeWW&si=4om73pMxQvuToQvh' },
      { title: 'Combinatorics', url: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHgm_UqwqckMxM68HS4BkjYY&si=ksPAjkwm2cb28NVn' },
      { title: 'Recurrence Relations', url: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHhhTH0o1JBMgscMUvxs4E_4&si=r3THjdW_19iFCAIm' },
      { title: 'Group Theory', url: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHhXves0XVa8d5O6F4rUi3KR&si=8-C9TfTK2XjdG6Pt' },
      { title: 'Graph Theory', url: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHjQoj0k-BlI9zXE0QKdl-lI&si=GGNFwhNSHxhdcJOQ' },
      { title: 'Generating Function', url: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHjQoj0k-BlI9zXE0QKdl-lI&si=GGNFwhNSHxhdcJOQ' },
      { title: 'Set Theory', url: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHjHnhdkPWFAlcizVQJ8w4TX&si=aOl21dH2q3NjaDgx' },
    ],
    revisionPyqs: [
      { title: 'Revision & PYQs Video Solutions', url: 'https://youtube.com/playlist?list=PL3eEXnCBViH-WZfR3PRFfYs7WjUgcBlAZ&si=_QvuJAWFGK_Dswby' },
    ],
    nptelLectures: [
      { title: 'NPTEL Discrete Maths', url: 'https://youtube.com/playlist?list=PLgMDNELGJ1Ca7hpEIYtWvMXKcTx88OD2O&si=1WcmQtcIG0sFqSlg' },
    ],
    textbooks: [
      { name: 'Discrete Mathematics and Its Applications by Kenneth H. Rosen', edition: 'Indian 7E', chapters: 'ch 1, 2, 4-8, 11.1-11.3' },
      { name: 'Discrete Mathematics with Applications by Susanna S. Epp', edition: '4E', chapters: 'ch 1, 2.1-2.3, 3, 4(optional), 5.1, 5.5-5.7, 6-10, 11-12(optional)' },
    ],
    topicwisePyqs: [
      { title: 'Topicwise PYQs (GitHub)', url: 'https://github.com/GATEOverflow/GO-PDFs/releases/tag/gatecse-2025' },
    ],
    freeTests: [
      { title: 'GO Classes 2025 Weekly Quiz 5 - Propositional Logic', url: 'https://gateoverflow.in/exam/601/go-classes-2025-weekly-quiz-5-propositional-logic' },
      { title: 'GO Classes 2025 Weekly Quiz 6 - Propositional Logic', url: 'https://gateoverflow.in/exam/602/go-classes-2025-weekly-quiz-6-propositional-logic' },
      { title: 'GO Classes 2025 Weekly Quiz 7 - Propositional Logic', url: 'https://gateoverflow.in/exam/603/go-classes-2025-weekly-quiz-7-propositional-logic' },
      { title: 'GO Classes 2025 Weekly Quiz 8 - Set Theory', url: 'https://gateoverflow.in/exam/605/go-classes-2025-weekly-quiz-8-set-theory' },
      { title: 'GO Classes CS 2025 Weekly Quiz 6 - Functions', url: 'https://gateoverflow.in/exam/614/go-classes-cs-2025-weekly-quiz-6-functions' },
      { title: 'GO Classes CS 2025 Weekly Quiz 7 - Relations', url: 'https://gateoverflow.in/exam/622/go-classes-cs-2025-weekly-quiz-7-relations' },
      { title: 'GO Classes CS 2025 Weekly Quiz 15 - Lattice & Poset', url: 'https://gateoverflow.in/exam/641/go-classes-cs-2025-weekly-quiz-15-lattice-%26-poset' },
      { title: 'DM Propositional Logic Test 1', url: 'https://gateoverflow.in/exam/438/discrete-mathematics-propositional-logic-test-1' },
      { title: 'DM Propositional Logic Test 2', url: 'https://gateoverflow.in/exam/441/discrete-mathematics-propositional-logic-test-2' },
      { title: 'DM Logic Test 3', url: 'https://gateoverflow.in/exam/447/discrete-mathematics-logic-test-3' },
      { title: 'DM Logic Test 4', url: 'https://gateoverflow.in/exam/456/discrete-mathematics-logic-test-4' },
      { title: 'Set Theory & Algebra GATE 2020 Previous 1', url: 'https://gateoverflow.in/exam/191/set-theory-%26-algebra-gate2020-previous-gate-1' },
      { title: 'Set Theory & Algebra GATE 2020 Previous 2', url: 'https://gateoverflow.in/exam/192/set-theory-%26-algebra-gate2020-previous-gate-2' },
      { title: 'Combinatorics GATE 2020 Previous 1', url: 'https://gateoverflow.in/exam/193/combinatorics-gate2020-previous-gate-1' },
      { title: 'Mathematical Logic GATE 2020 Previous 1', url: 'https://gateoverflow.in/exam/194/mathematical-logic-gate2020-previous-gate-1' },
      { title: 'Mathematical Logic GATE 2020 Previous 2', url: 'https://gateoverflow.in/exam/195/mathematical-logic-gate2020-previous-gate-2' },
      { title: 'Graph Theory GATE 2020 Previous 1', url: 'https://gateoverflow.in/exam/196/graph-theory-gate2020-previous-gate-1' },
      { title: 'Set Theory & Algebra Previous GATE 1', url: 'https://gateoverflow.in/exam/87/set-theory-%26-algebra-previous-gate-1' },
      { title: 'Graph Theory Previous GATE 1', url: 'https://gateoverflow.in/exam/69/graph-theory-previous-gate-1' },
    ],
  },
  {
        id: 'la',
    name: 'Linear Algebra',
    shortName: 'LA',
    youtubePlaylists:
     [
      { title: 'Full Linear Algebra Playlist', url: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHhGLQ1ZT37KLpBMAD90CM4_&si=VpylHczkW8ylqspx' },
    ],
    revisionPyqs: [
      { title: 'Revision & PYQs Video Solution', url: 'https://www.youtube.com/live/7vdSWFVKzZg?si=STl2XSSu8T7S_Iaw' },
    ],
    nptelLectures: [
      { title: 'NPTEL Linear Algebra', url: 'https://youtube.com/playlist?list=PLFW6lRTa1g80fZ1giRbqbe_XdXPdkkyqY&si=l3-KeMND-CfmrJzv' },
    ],
    textbooks: [],
    topicwisePyqs: [
      { title: 'Topicwise PYQs (GitHub)', url: 'https://github.com/GATEOverflow/GO-PDFs/releases/tag/gatecse-2025' },
    ],
    freeTests: [
      { title: 'GO Classes 2025 Weekly Quiz 3 - Linear Algebra', url: 'https://gateoverflow.in/exam/598/go-classes-2025-weekly-quiz-3-fundamental-course-and-linear-algebra' },
      { title: 'GO Classes 2025 Weekly Quiz 4 - Linear Algebra', url: 'https://gateoverflow.in/exam/600/go-classes-2025-weekly-quiz-4-linear-algebra' },
      { title: 'GO Classes 2025 Common Weekly Quiz 5 - Linear Algebra', url: 'https://gateoverflow.in/exam/606/go-classes-2025-common-weekly-quiz-5-linear-algebra' },
      { title: 'Linear Algebra Previous GATE 1', url: 'https://gateoverflow.in/exam/68/linear-algebra-previous-gate-1' },
      { title: 'Linear Algebra GATE 2020 Previous 1', url: 'https://gateoverflow.in/exam/161/linear-algebra-gate2020-previous-gate-1' },
      { title: 'Linear Algebra GATE 2020 Previous 2', url: 'https://gateoverflow.in/exam/162/linear-algebra-gate2020-previous-gate-2' },
    ],
    additional: [
      { title: 'Videos for Intuition (3Blue1Brown)', url: 'https://youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab&si=YAaXZ9srWqvlpwz8' },
    ],
  },
  {
    id: 'prob',
    name: 'Probability',
    shortName: 'Prob.',
    youtubePlaylists: [
      { title: 'Full Probability Playlist', url: 'https://youtube.com/playlist?list=PLhLZ_zxDsyOIKbQfKFM05BLYRhUZ7JP-M&si=PhhEGh77ahUsqikf' },
    ],
    revisionPyqs: [
      { title: 'Revision & PYQs Video Solution', url: 'https://youtu.be/_nuQwy9DGmw?si=rr7WOwRJ_F0Qqjn8' },
    ],
    nptelLectures: [
      { title: 'NPTEL Probability Lectures', url: 'https://youtube.com/playlist?list=PLyqSpQzTE6M_JcleDbrVyPnE0PixKs2JE&si=o0htQ1hAn60vNLRK' },
    ],
    textbooks: [
      { name: 'Introduction to Probability Models by Sheldon M. Ross' },
    ],
    topicwisePyqs: [
      { title: 'Topicwise PYQs (GitHub)', url: 'https://github.com/GATEOverflow/GO-PDFs/releases/tag/gatecse-2025' },
    ],
    freeTests: [
      { title: 'GO Classes CS/DA 2025 Weekly Quiz 6 - Conditional Probability', url: 'https://gateoverflow.in/exam/623/go-classes-cs-da-2025-weekly-quiz-6-conditional-probability' },
      { title: 'GO Classes 2025 Weekly Quiz 13 - Probability Distributions', url: 'https://gateoverflow.in/exam/628/go-classes-2025-weekly-quiz-13-probability-distributions' },
      { title: 'Probability Previous GATE 1', url: 'https://gateoverflow.in/exam/67/probability-previous-gate-1' },
      { title: 'Probability GATE 2020 Previous 1', url: 'https://gateoverflow.in/exam/159/probability-gate2020-previous-gate-1' },
      { title: 'Probability GATE 2020 Previous 2', url: 'https://gateoverflow.in/exam/160/probability-gate2020-previous-gate-2' },
    ],
    additional: [
      { title: 'Probability Course (Online Resource)', url: 'https://www.probabilitycourse.com/' },
    ],
  },
  {
    id: 'calc',
    name: 'Calculus',
    shortName: 'Calc.',
    youtubePlaylists: [],
    revisionPyqs: [
      { title: 'Revision & PYQs Video Solutions', url: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHi3R5H_NDKCB3aGvtLYlLrz&si=DGxz1haxSAbWSEsq' },
    ],
    nptelLectures: [
      { title: 'NPTEL Calculus Lectures', url: 'https://youtube.com/playlist?list=PLEAYkSg4uSQ0q9CDkHkJGdUTQOgH1DLDj&si=Rt5U9aaad4jiXdT_' },
    ],
    textbooks: [],
    topicwisePyqs: [
      { title: 'Topicwise PYQs (GitHub)', url: 'https://github.com/GATEOverflow/GO-PDFs/releases/tag/gatecse-2025' },
    ],
    freeTests: [
      { title: 'GO Classes 2025 Weekly Quiz 21 - Calculus', url: 'https://gateoverflow.in/exam/659/go-classes-2025-weekly-quiz-21-calculus' },
      { title: 'Calculus GATE 2020 Previous 1', url: 'https://gateoverflow.in/exam/164/calculus-gate2020-previous-gate-1' },
    ],
    additional: [
      { title: 'Mohit Tyagi YouTube (relevant videos)', url: 'https://youtube.com/@mohittyagi' },
      { title: 'Khan Academy Calculus', url: 'https://www.khanacademy.org/math/calculus-1' },
    ],
  },
  {
    id: 'aptitude',
    name: 'Aptitude',
    shortName: 'Apt.',
    youtubePlaylists: [],
    revisionPyqs: [],
    nptelLectures: [],
    textbooks: [],
    topicwisePyqs: [],
    freeTests: [
      { title: 'GO Classes 2025 Monthly Quiz 1 - GA', url: 'https://gateoverflow.in/exam/610/go-classes-2025-monthly-quiz-1-general-aptitude' },
      { title: 'GO Classes CS/DA 2025 Monthly Quiz 2 - GA', url: 'https://gateoverflow.in/exam/631/go-classes-cs-da-2025-monthly-quiz-2-general-aptitude' },
      { title: 'GO Classes CS/DA 2025 Monthly Quiz 3 - GA', url: 'https://gateoverflow.in/exam/660/go-classes-cs-da-2025-monthly-quiz-3-general-aptitude' },
      { title: 'GO 2017 Aptitude 1', url: 'https://gateoverflow.in/exam/36/go2017-aptitude-1' },
      { title: 'General Aptitude Set 2', url: 'https://gateoverflow.in/exam/64/general-aptitude-set-2' },
    ],
    additional: [
      { title: 'Resources, Short Notes & Topic List Video', url: 'https://youtu.be/IADuDzccEOI?si=nNrS9v50ORGVxLgN' },
    ],
  },
]

export const generalResources: GeneralResources = {
  fullLengthMocks: [
    { title: 'GO 2017 Mock 1', url: 'https://gateoverflow.in/exam/70/go-17-mock-1' },
    { title: 'GO 2017 Mock 2', url: 'https://gateoverflow.in/exam/73/go-17-mock-2' },
    { title: 'GO 2017 Mock 3', url: 'https://gateoverflow.in/exam/74/go-17-mock-3' },
    { title: 'GO 2018 Mock 4', url: 'https://gateoverflow.in/exam/79/go-18-mock-4' },
    { title: 'Test by Ruturaj Mock 1', url: 'https://gateoverflow.in/exam/126/test-by-ruturaj-mock-1' },
    { title: 'Applied Course 2019 Mock 1', url: 'https://gateoverflow.in/exam/136/applied-course-2019-mock1' },
  ],
  previousYearPapers: [
    { title: 'GATE CSE 2024 Set 1', url: 'https://gateoverflow.in/exam/594/gate-cse-2024-set-1-original-paper' },
    { title: 'GATE CSE 2024 Set 2', url: 'https://gateoverflow.in/exam/595/gate-cse-2024-set-2-original-paper' },
    { title: 'GATE CSE 2023', url: 'https://gateoverflow.in/exam/430/gate-cse-2023-original-paper' },
    { title: 'GATE CSE 2022', url: 'https://gateoverflow.in/exam/298/gate-cse-2022' },
    { title: 'GATE 2021', url: 'https://gateoverflow.in/exam/263/gate-2021' },
    { title: 'GATE CSE 2021 Set 2', url: 'https://gateoverflow.in/exam/264/gate-cse-2021-set-2' },
    { title: 'GATE CSE 2020', url: 'https://gateoverflow.in/exam/218/gate-cse-2020' },
    { title: 'GATE 2019', url: 'https://gateoverflow.in/exam/141/gate2019' },
    { title: 'GATE 2018', url: 'https://gateoverflow.in/exam/88/gate2018' },
    { title: 'GATE 2017 Set 1', url: 'https://gateoverflow.in/exam/76/gate-2017-set-1' },
    { title: 'GATE 2017 Set 2', url: 'https://gateoverflow.in/exam/75/gate-2017-set-2' },
    { title: 'GATE 2016 Set 1', url: 'https://gateoverflow.in/exam/8/gate-2016-1' },
    { title: 'GATE 2016 Set 2', url: 'https://gateoverflow.in/exam/9/gate-2016-2' },
    { title: 'GATE 2015 Set 1', url: 'https://gateoverflow.in/exam/10/gate-2015-1' },
    { title: 'GATE 2015 Set 2', url: 'https://gateoverflow.in/exam/11/gate-2015-2' },
    { title: 'GATE 2015 Set 3', url: 'https://gateoverflow.in/exam/12/gate-2015-3' },
  ],
  notes: [
    { title: 'GATE CSE Notes from Standard Books', url: 'https://drive.google.com/drive/folders/1oGCYictHLqXE1skdkJ8PnaefBnLrRXwG' },
    { title: 'Handwritten Notes (GitHub)', url: 'https://github.com/baquer/GATE-and-CSE-Resources-for-Students/blob/master/AnkurGuptaNotes/CompilerDesign.pdf' },
    { title: 'Short Notes & Imp Questions Video', url: 'https://youtu.be/9HAxjug36wA?si=IkgiP3lGFiZYKAl7' },
  ],
}
