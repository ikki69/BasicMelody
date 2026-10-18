import type { MaterialId } from '../../data/materials';

/** Pose maskot — satu berkas .svg per pose di src/assets/mentor/. */
export type MentorPose = 'point' | 'talk' | 'wave';

/** Urutan pose untuk langkah/materi ke-1, ke-2, ke-3. */
export const MENTOR_POSES: readonly MentorPose[] = ['point', 'talk', 'wave'];

/** Pose pengenalan tiap materi: M1 menunjuk, M2 berbicara, M3 melambai. */
const MATERIAL_POSE: Record<MaterialId, MentorPose> = {
  m1: 'point',
  m2: 'talk',
  m3: 'wave',
};

export const poseForMaterial = (materialId: MaterialId): MentorPose => MATERIAL_POSE[materialId];

/** Pose untuk langkah Introduction 1–3. */
export const poseForStep = (step: number): MentorPose =>
  MENTOR_POSES[(step - 1) % MENTOR_POSES.length] ?? 'point';
