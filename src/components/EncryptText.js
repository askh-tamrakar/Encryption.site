import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import './EncryptText.css';

const EncryptText = ({
  text,
  speed = 40,
  maxIterations = 12,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+',
  className = 'encrypt-text',
  encryptedClassName = 'encrypted',
  ...props
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef(null);

  // Helper function to scramble characters
  const scramble = (originalText) => {
    const chars = characters.split('');
    return originalText
      .split('')
      .map((ch) => (ch === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]))
      .join('');
  };

  useEffect(() => {
    clearInterval(intervalRef.current);
    let iterations = 0;

    if (isHovering) {
      // Encrypt on hover
      setIsAnimating(true);
      intervalRef.current = setInterval(() => {
        setDisplayText(scramble(text));
        iterations++;
        if (iterations >= maxIterations) {
          clearInterval(intervalRef.current);
        }
      }, speed);
    } else {
      // Decrypt on mouse leave
      setIsAnimating(true);
      intervalRef.current = setInterval(() => {
        iterations++;
        if (iterations >= maxIterations / 2) {
          setDisplayText(text);
          clearInterval(intervalRef.current);
          setIsAnimating(false);
        } else {
          setDisplayText(scramble(text));
        }
      }, speed);
    }

    return () => clearInterval(intervalRef.current);
  }, [isHovering, text, speed, maxIterations]);

  return (
    <motion.span
      className="wrapper encrypt-text"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      <span className='srOnly'>{text}</span>
      <span aria-hidden="true">
        {displayText.split('').map((char, index) => (
          <span
            key={index}
            className={isAnimating && isHovering ? encryptedClassName : className}
            style={{ transition: 'color 0.3s ease' }}
          >
            {char}
          </span>
        ))}
      </span>
    </motion.span>
  );
};

export default EncryptText;
