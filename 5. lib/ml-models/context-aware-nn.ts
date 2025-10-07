export class ContextAwareNN {
  adjustForContext(basePrediction: number, context: any): number {
    let adjusted = basePrediction;
    if (context.weather?.condition === 'rain') adjusted *= 0.95;
    if (context.injuries?.length > 2) adjusted *= 0.9;
    if (context.referee?.strictness > 7) adjusted *= 0.92;
    return adjusted;
  }
}
