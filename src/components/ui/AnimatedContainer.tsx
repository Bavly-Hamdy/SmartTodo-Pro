import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export interface AnimatedContainerProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'bounce' | 'flip' | 'zoom';
  duration?: number;
  delay?: number;
  className?: string;
  whileHover?: boolean;
  whileTap?: boolean;
  stagger?: boolean;
  staggerDelay?: number;
  exitAnimation?: boolean;
  threshold?: number;
  trigger?: 'onMount' | 'onScroll' | 'onHover' | 'onClick';
}

const animationVariants: Record<string, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  bounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: { opacity: 0, scale: 0.3 },
  },
  flip: {
    initial: { opacity: 0, rotateY: -90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: 90 },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.2 },
  },
};

const hoverVariants = {
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  },
};

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'fade',
  duration = 0.3,
  delay = 0,
  className = '',
  whileHover = false,
  whileTap = false,
  stagger = false,
  staggerDelay = 0.1,
  exitAnimation = true,
  threshold = 0.1,
  trigger = 'onMount',
}) => {
  const variants = animationVariants[animation];
  
  const transition = {
    duration,
    delay,
    ease: [0.4, 0, 0.2, 1], // Custom easing
  };

  const containerVariants = stagger ? {
    animate: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  } : {};

  const motionProps = {
    variants: variants,
    transition,
    className,
    ...(whileHover && { whileHover: 'hover' }),
    ...(whileTap && { whileTap: 'tap' }),
    ...(stagger && containerVariants),
  };

  if (trigger === 'onScroll') {
    return (
      <motion.div
        {...motionProps}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: threshold }}
        exit={exitAnimation ? "exit" : undefined}
      >
        {children}
      </motion.div>
    );
  }

  if (trigger === 'onHover') {
    return (
      <motion.div
        {...motionProps}
        initial="initial"
        whileHover="animate"
        exit={exitAnimation ? "exit" : undefined}
      >
        {children}
      </motion.div>
    );
  }

  if (trigger === 'onClick') {
    return (
      <motion.div
        {...motionProps}
        initial="initial"
        whileTap="animate"
        exit={exitAnimation ? "exit" : undefined}
      >
        {children}
      </motion.div>
    );
  }

  // Default: onMount
  return (
    <AnimatePresence mode="wait">
      <motion.div
        {...motionProps}
        initial="initial"
        animate="animate"
        exit={exitAnimation ? "exit" : undefined}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Specialized animated components
export const FadeIn: React.FC<Omit<AnimatedContainerProps, 'animation'>> = (props) => (
  <AnimatedContainer {...props} animation="fade" />
);

export const SlideUp: React.FC<Omit<AnimatedContainerProps, 'animation'>> = (props) => (
  <AnimatedContainer {...props} animation="slideUp" />
);

export const ScaleIn: React.FC<Omit<AnimatedContainerProps, 'animation'>> = (props) => (
  <AnimatedContainer {...props} animation="scale" />
);

export const BounceIn: React.FC<Omit<AnimatedContainerProps, 'animation'>> = (props) => (
  <AnimatedContainer {...props} animation="bounce" />
);

export const FlipIn: React.FC<Omit<AnimatedContainerProps, 'animation'>> = (props) => (
  <AnimatedContainer {...props} animation="flip" />
); 