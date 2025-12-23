import { Composition } from "remotion";
import { MosaicComposition, calculateTotalFrames } from "./features/composition/MosaicComposition";
import { DEFAULT_PROJECT_CONFIG, RESOLUTION_PRESETS } from "./lib/types";
import { compositionPropsSchema } from "./lib/types";

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="AutoMosaic"
                component={MosaicComposition as any}
                durationInFrames={30 * 30} // Default duration, overridden by props
                fps={30}
                width={1920}
                height={1080}
                schema={compositionPropsSchema}
                defaultProps={{
                    slides: [],
                    width: 1920,
                    height: 1080,
                    fps: 30,
                    backgroundColor: "#000000",
                    enabledTransitions: DEFAULT_PROJECT_CONFIG.enabledTransitions,
                    randomizeTransitions: true,
                }}
                calculateMetadata={async ({ props }) => {
                    const durationInFrames = calculateTotalFrames(props.slides);
                    return {
                        durationInFrames: Math.max(durationInFrames, 1), // Ensure at least 1 frame
                        width: props.width,
                        height: props.height,
                    };
                }}
            />
        </>
    );
};
