export type RobotMood = 'idle' | 'curious' | 'happy' | 'excited' | 'thinking' | 'confident';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface SectionRobotState {
  id: string;
  mood: RobotMood;
  message: string;
  subMessage?: string;
  position: Vector3D;
  rotation: Vector3D;
}
