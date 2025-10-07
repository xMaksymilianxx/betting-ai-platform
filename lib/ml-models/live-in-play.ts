export class LiveInPlayModel {
  updatePrediction(current: any, liveData: any): any {
    const timeAdjustment = (90 - liveData.minute) / 90;
    return {
      ...current,
      confidence: current.confidence * timeAdjustment,
      adjusted: true,
    };
  }
}
