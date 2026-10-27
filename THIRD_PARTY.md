# Third-party material

These files come from other projects and keep their original terms.

| File | Origin | License |
|---|---|---|
| `labs/part3-mpi/hypre_test.c` | hypre example (Lawrence Livermore National Security, LLC and the HYPRE developers), via ParaTools' [e4s-cloud-examples](https://github.com/ParaToolsInc/e4s-cloud-examples) `containers/e4s-cl-example`. Modified: the `seq_mv.h` include falls back to `_hypre_seq_mv.h` for hypre 3.x | Apache-2.0 OR MIT (see the file header) |
| `labs/part2/petsc/ex50.c`, `labs/part2/petsc/makefile` | PETSc tutorial example ex50 (contributed by Michael Boghosian), via e4s-cloud-examples `petsc-cpu` | PETSc license (BSD-2-Clause) |
| `labs/part2/in.lj` | LAMMPS Lennard-Jones benchmark input, via e4s-cloud-examples `lammps` | GPL-2.0 (LAMMPS) |
| `labs/part3-alc/hypre.yaml` | Adapted from e4s-cloud-examples `containers/e4s-alc-example/hypre-build-specs.yaml` | Used with permission of ParaTools, Inc. |
| `labs/part2/lammps.sbatch`, `labs/part2/petsc/ex50.sbatch`, `labs/part3-alc/03_run_custom.sbatch` | Workflows adapted from the corresponding e4s-cloud-examples scripts | Used with permission of ParaTools, Inc. |
| `slides/assets/e4scl_diagram.png` | e4s-cl architecture diagram from Sameer Shende's "E4S at NERSC" training slides (Aug 2022) | Used with permission of Sameer Shende |
| `slides/assets/e4s_download_page.png` | Screenshot of e4s.io/container-download from Sameer Shende's "E4S 26.06 release" slides | Used with permission of Sameer Shende |

Several slides adapt text and figures from Sameer Shende's E4S tutorial decks (E4S 26.06 and
25.11 release slides, the MUG'26 tutorial, E4S at NERSC 2022), with permission; each slide
credits its source. Measured numbers in the slides and lab guide come from Midway3
runs in October 2026.

Software used but not redistributed here: [E4S](https://e4s.io) container images,
[e4s-cl](https://github.com/E4S-Project/e4s-cl), [e4s-alc](https://github.com/E4S-Project/e4s-alc),
[Apptainer](https://apptainer.org), and the npm packages in `slides/package.json`.
