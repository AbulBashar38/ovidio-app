import { tva } from "@gluestack-ui/utils/nativewind-utils";
import { cssInterop } from "nativewind";
import React, { useEffect, useRef } from "react";
import { Animated, ViewProps } from "react-native";

const skeletonStyle = tva({
    base: "w-full bg-background-200 overflow-hidden",
    variants: {
        variant: {
            sharp: "rounded-none",
            circular: "rounded-full",
            rounded: "rounded-md",
        },
    },
});

const AnimatedView = Animated.View;

cssInterop(AnimatedView, { className: 'style' });

type ISkeletonProps = ViewProps & {
    variant?: "sharp" | "circular" | "rounded";
    speed?: number;
    className?: string;
};

const Skeleton = React.forwardRef<any, ISkeletonProps>(
    ({ className, variant = "rounded", speed = 1, style, ...props }, ref) => {
        const opacity = useRef(new Animated.Value(0.5)).current;

        useEffect(() => {
            const loop = Animated.loop(
                Animated.sequence([
                    Animated.timing(opacity, {
                        toValue: 1,
                        duration: 1000 / speed,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0.5,
                        duration: 1000 / speed,
                        useNativeDriver: true,
                    }),
                ])
            );
            loop.start();
            return () => loop.stop();
        }, [opacity, speed]);

        return (
            <AnimatedView
                ref={ref}
                className={skeletonStyle({ variant, class: className })}
                style={[{ opacity }, style]}
                {...props}
            />
        );
    }
);

Skeleton.displayName = "Skeleton";

const SkeletonText = React.forwardRef<any, ISkeletonProps & { _lines?: number; gap?: number }>(
    ({ className, _lines = 3, gap = 8, ...props }, ref) => {
        return (
            <React.Fragment>
                {Array.from({ length: _lines }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className={`${className} h-3 w-full rounded-sm mb-2`}
                        {...props}
                    />
                ))}
            </React.Fragment>
        )
    }
)
SkeletonText.displayName = "SkeletonText";

export { Skeleton, SkeletonText };
