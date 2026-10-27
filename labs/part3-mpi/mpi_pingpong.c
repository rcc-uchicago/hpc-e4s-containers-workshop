/*
 * mpi_pingpong.c - which MPI am I really using, and how fast is it?
 *
 * Prints the MPI library version string reported at run time (this is what
 * changes when e4s-cl swaps the container's MPI for the host's), the node each
 * rank landed on, and a ping-pong latency/bandwidth measurement between rank 0
 * and the last rank (on different nodes when the job spans two nodes).
 */
#include <mpi.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char **argv)
{
    setvbuf(stdout, NULL, _IOLBF, 0);   /* line-buffered, so batch logs fill in as we go */
    MPI_Init(&argc, &argv);

    int rank, size, len;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &size);

    char host[MPI_MAX_PROCESSOR_NAME];
    MPI_Get_processor_name(host, &len);

    if (rank == 0) {
        char version[MPI_MAX_LIBRARY_VERSION_STRING];
        MPI_Get_library_version(version, &len);
        char *nl = strchr(version, '\n');   /* first line is enough */
        if (nl) *nl = '\0';
        printf("MPI library : %s\n", version);
        printf("Ranks       : %d\n", size);
    }
    MPI_Barrier(MPI_COMM_WORLD);
    printf("  rank %3d on %s\n", rank, host);
    fflush(stdout);
    MPI_Barrier(MPI_COMM_WORLD);

    if (size < 2) {
        if (rank == 0) printf("Need at least 2 ranks for ping-pong.\n");
        MPI_Finalize();
        return 0;
    }

    const int peer = size - 1;
    const size_t sizes[] = {8, 1024, 65536, 1048576, 4194304};
    const int nsizes = sizeof(sizes) / sizeof(sizes[0]);
    char *buf = malloc(sizes[nsizes - 1]);
    memset(buf, 1, sizes[nsizes - 1]);

    if (rank == 0)
        printf("\nPing-pong rank 0 <-> rank %d\n%12s %14s %14s\n",
               peer, "bytes", "latency(us)", "bandwidth(MB/s)");

    for (int s = 0; s < nsizes; s++) {
        const size_t n = sizes[s];
        const int iters = n <= 65536 ? 1000 : 100;
        const int warmup = 10;
        double t0 = 0.0;

        if (rank == 0 || rank == peer) {
            for (int i = 0; i < iters + warmup; i++) {
                if (i == warmup) t0 = MPI_Wtime();
                if (rank == 0) {
                    MPI_Send(buf, (int)n, MPI_CHAR, peer, 0, MPI_COMM_WORLD);
                    MPI_Recv(buf, (int)n, MPI_CHAR, peer, 0, MPI_COMM_WORLD, MPI_STATUS_IGNORE);
                } else {
                    MPI_Recv(buf, (int)n, MPI_CHAR, 0, 0, MPI_COMM_WORLD, MPI_STATUS_IGNORE);
                    MPI_Send(buf, (int)n, MPI_CHAR, 0, 0, MPI_COMM_WORLD);
                }
            }
            if (rank == 0) {
                double one_way = (MPI_Wtime() - t0) / (2.0 * iters);
                printf("%12zu %14.2f %14.1f\n", n, one_way * 1e6, n / one_way / 1e6);
            }
        }
        MPI_Barrier(MPI_COMM_WORLD);
    }

    free(buf);
    MPI_Finalize();
    return 0;
}
