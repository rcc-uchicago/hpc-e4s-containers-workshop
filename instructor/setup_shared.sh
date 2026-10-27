#!/bin/bash
# setup_shared.sh - install the E4S workshop images, tools and labs into a shared
# directory that every participant can read.
#
# Usage:
#   instructor/setup_shared.sh [--link] [--private] [--gpu] [DEST]
#
#   DEST     default /project/rcc/workshops/e4s
#   --link     symlink the images instead of copying them (for a private test
#              install; participants cannot follow links into a private directory)
#   --private  leave the install readable by the group only (rcc-staff) while
#              testing; re-run without it to open the install to participants
#   --gpu      also install the 34 GB CUDA image (optional GPU demo only; its
#              /etc/bash.bashrc installs npm tools into $HOME, see INSTRUCTOR_NOTES.md)
#
# Images are taken from ../images next to this script (download them first with
# instructor/fetch_images.sh). Re-running is safe: images are only copied when
# missing, tools and labs are refreshed.

set -euo pipefail

LINK=0 PRIVATE=0 GPU=0
while [ $# -gt 0 ]; do
    case "$1" in
        --link)    LINK=1; shift ;;
        --private) PRIVATE=1; shift ;;
        --gpu)     GPU=1; shift ;;
        *) break ;;
    esac
done
DEST=${1:-/project/rcc/workshops/e4s}
SRC=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

E4S_CL_VERSION=1.0.9
E4S_ALC_TAG=v1.0.3
PYTHON_MODULE=python/3.11.9

echo "Installing workshop from $SRC into $DEST"
mkdir -p "$DEST"/{images,tools,bin}

# ---- images -------------------------------------------------------------------
for img in e4s-cpu-x86_64-26.06.sif ecpe4s-ubuntu24.04.sif; do
    if [ ! -f "$SRC/images/$img" ]; then
        echo "ERROR: $SRC/images/$img missing; run instructor/fetch_images.sh first" >&2
        exit 1
    fi
    if [ "$LINK" = 1 ]; then
        ln -sfn "$SRC/images/$img" "$DEST/images/$img"
    elif [ ! -f "$DEST/images/$img" ]; then
        echo "Copying $img ..."
        cp "$SRC/images/$img" "$DEST/images/$img.partial"
        mv "$DEST/images/$img.partial" "$DEST/images/$img"
    fi
done
# Optional extras: pre-built fallback for the e4s-alc exercise, GPU image on request.
EXTRAS=(prebuilt-ubuntu24.04_hypre.sif)
[ "$GPU" = 1 ] && EXTRAS+=(e4s-cuda80-x86_64-26.06.sif)
for img in "${EXTRAS[@]}"; do
    [ -f "$SRC/images/$img" ] || continue
    if [ "$LINK" = 1 ]; then ln -sfn "$SRC/images/$img" "$DEST/images/$img"
    elif [ ! -f "$DEST/images/$img" ]; then cp "$SRC/images/$img" "$DEST/images/$img"; fi
done

# ---- tools: e4s-cl and e4s-alc in their own virtual environments ---------------
type module >/dev/null 2>&1 || source /etc/profile.d/zzz-rcc.sh
module load "$PYTHON_MODULE"
if [ ! -x "$DEST/tools/e4s-cl/bin/e4s-cl" ]; then
    python3 -m venv "$DEST/tools/e4s-cl"
    "$DEST/tools/e4s-cl/bin/pip" install -q --upgrade pip
    "$DEST/tools/e4s-cl/bin/pip" install -q "e4s-cl==$E4S_CL_VERSION"
fi
if [ ! -x "$DEST/tools/e4s-alc/bin/e4s-alc" ]; then
    python3 -m venv "$DEST/tools/e4s-alc"
    "$DEST/tools/e4s-alc/bin/pip" install -q --upgrade pip
    "$DEST/tools/e4s-alc/bin/pip" install -q "git+https://github.com/E4S-Project/e4s-alc.git@$E4S_ALC_TAG"
fi
ln -sfn ../tools/e4s-cl/bin/e4s-cl   "$DEST/bin/e4s-cl"
ln -sfn ../tools/e4s-alc/bin/e4s-alc "$DEST/bin/e4s-alc"

# ---- environment file and labs ---------------------------------------------------
# Keep the Slurm settings if they were already edited in the installed env.sh.
KEEP=""
[ -f "$DEST/env.sh" ] && KEEP=$(grep -E '^E4S_SLURM_(ACCOUNT|RESERVATION|PARTITION)=' "$DEST/env.sh" || true)
cp "$SRC/shared/env.sh" "$DEST/env.sh"
while IFS= read -r line; do
    [ -n "$line" ] || continue
    esc=$(printf '%s' "$line" | sed 's/[&\\|]/\\&/g')
    sed -i "s|^${line%%=*}=.*|$esc|" "$DEST/env.sh"
    echo "Kept $line"
done <<< "$KEEP"
rm -rf "$DEST/labs"
cp -r "$SRC/labs" "$DEST/labs"
# The e4s-alc recipe needs the absolute path of the shared base image.
find "$DEST/labs" -name "*.yaml" -exec sed -i "s|@E4S_WORKSHOP@|$DEST|g" {} +

# ---- permissions: everyone can read, only rcc-staff can change ---------------------
chmod -R g+rwX "$DEST" 2>/dev/null || true
if [ "$PRIVATE" = 1 ]; then
    chmod -R o-rwx "$DEST"
    echo "Install is PRIVATE (group only). Re-run without --private to open it to participants."
else
    chmod -R o+rX "$DEST"
fi

echo
echo "Done. Participants run:"
echo "    source $DEST/env.sh"
echo "    cp -r $DEST/labs \$E4S_SCRATCH/e4s-labs && cd \$E4S_SCRATCH/e4s-labs"
