export class Interpolator {
    /**
     * Cubic Bezier interpolation
     * @param x1 X1
     * @param x2 X2
     * @param y1 Y1
     * @param y2 Y2
     * @param x Weight
     * @returns Interpolated value
     */
    public static cubicBezierInterpolate(x1: number, x2: number, y1: number, y2: number, x: number): number {
        let c = 0.5;
        let t = c;
        let s = 1.0 - t;
        const loop = 15;
        const eps = 1e-5;
        const math = Math;

        let sst3: number, stt3: number, ttt: number;

        for (let i = 0; i < loop; ++i) {
            sst3 = 3.0 * s * s * t;
            stt3 = 3.0 * s * t * t;
            ttt = t * t * t;

            const ft = (sst3 * x1) + (stt3 * x2) + (ttt) - x;

            if (math.abs(ft) < eps) break;

            c /= 2.0;

            t += (ft < 0) ? c : -c;
            s = 1.0 - t;
        }
        return (sst3! * y1) + (stt3! * y2) + ttt!;
    }

    /**
     * Linear interpolation
     * @param x1 X1
     * @param x2 X2
     * @param x Weight
     * @returns Interpolated value
     */
    public static linearInterpolate(x1: number, x2: number, x: number): number {
        return x1 + (x2 - x1) * x;
    }
}
