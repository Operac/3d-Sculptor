import { pipeline, env } from '@xenova/transformers';

// Skip local model check since we are grabbing from HF
env.allowLocalModels = false;

// We use the WASM backend for better performance
env.backends.onnx.wasm.numThreads = 1;

class DepthEstimatorPipeline {
  static task = 'depth-estimation' as const;
  static model = 'Xenova/depth-anything-small-hf';
  static instance: any = null;

  static async getInstance(progress_callback: (progress: any) => void) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

self.addEventListener('message', async (event) => {
  const { type, imageSrc } = event.data;

  if (type === 'load') {
    // Start downloading the model immediately
    await DepthEstimatorPipeline.getInstance((progress) => {
      self.postMessage({ type: 'progress', data: progress });
    });
    self.postMessage({ type: 'loaded' });
  }

  if (type === 'estimate') {
    try {
      const estimator = await DepthEstimatorPipeline.getInstance((progress) => {
        self.postMessage({ type: 'progress', data: progress });
      });

      self.postMessage({ type: 'status', message: 'Estimating depth...' });
      const output = await estimator(imageSrc);
      
      // output.depth is a RawImage instance
      const depthData = output.depth.data;
      const width = output.depth.width;
      const height = output.depth.height;

      // Ensure we pass the buffer correctly avoiding structured cloning errors
      self.postMessage({
        type: 'done',
        depth: {
          data: depthData,
          width,
          height
        }
      });
    } catch (err) {
      self.postMessage({ type: 'error', error: err instanceof Error ? err.message : String(err) });
    }
  }
});
