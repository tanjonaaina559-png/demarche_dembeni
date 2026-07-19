const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/citizen/NewRequest.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the AnimatePresence block
// It currently looks like:
//         <AnimatePresence mode="wait" initial={false}>
//           <motion.div
//             key={currentStep}
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -20 }}
//             transition={{ duration: 0.15 }}
//           >
//             {/* ── STEP 1 : Sélection de la démarche ── */}
//             {currentStep === 1 && (
// ...
//             )}
// ...
//           </motion.div>
//         </AnimatePresence>

const oldBlockStart = `<AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
          >`;

const newBlockStart = `<AnimatePresence mode="wait" initial={false}>`;

content = content.replace(oldBlockStart, newBlockStart);

// We need to wrap each step in motion.div instead.
// Let's use regex to find each step and wrap it.

// Find `{currentStep === 1 && (`
content = content.replace(
  /\{\/\* â”€â”€ STEP 1(.*?)â”€â”€ \*\/\}\s*\{currentStep === 1 && \(\s*(<div[^>]*>)/s,
  `{/* ── STEP 1 $1── */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                $2`
);

content = content.replace(
  /\{\/\* â”€â”€ STEP 2(.*?)â”€â”€ \*\/\}\s*\{currentStep === 2 && \(\s*(<div[^>]*>)/s,
  `{/* ── STEP 2 $1── */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                $2`
);

content = content.replace(
  /\{\/\* â”€â”€ STEP 3(.*?)â”€â”€ \*\/\}\s*\{currentStep === 3 && \(\s*(<div[^>]*>)/s,
  `{/* ── STEP 3 $1── */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                $2`
);

content = content.replace(
  /\{\/\* â”€â”€ STEP 4(.*?)â”€â”€ \*\/\}\s*\{currentStep === 4 && \(\(\) => \{\s*(.*?)return \(\s*(<div[^>]*>)/s,
  `{/* ── STEP 4 $1── */}
            {currentStep === 4 && (() => {
              $2return (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                >
                  $3`
);

// Close the motion.div for each step.
// Notice in the original file:
//             )}
//
//             {/* ── STEP 2
// That means for step 1, 2, 3, we can find `)}` followed by `{/* ── STEP`
// For step 4, we find `})()}` followed by `</motion.div>`

content = content.replace(
  /\)\}\s*\{\/\* (â”€|─)+ STEP 2/g,
  `  </motion.div>
            )}

            {/* ── STEP 2`
);

content = content.replace(
  /\)\}\s*\{\/\* (â”€|─)+ STEP 3/g,
  `  </motion.div>
            )}

            {/* ── STEP 3`
);

content = content.replace(
  /\)\}\s*\{\/\* (â”€|─)+ STEP 4/g,
  `  </motion.div>
            )}

            {/* ── STEP 4`
);

content = content.replace(
  /\}\)\(\)\}\s*<\/motion\.div>/g,
  `  </motion.div>
              );
            })()}`
);

// Also remove the original </motion.div> that wrapped everything
content = content.replace(
  /\{\/\* Navigation Buttons \*\/\}/g,
  `</AnimatePresence>\n\n        {/* Navigation Buttons */}`
);

// Find the original AnimatePresence closing and remove it.
content = content.replace(
  /<\/AnimatePresence>\s*<\/AnimatePresence>/g,
  `</AnimatePresence>`
);

// We should just manually write out the replacement for the exact sections if regex fails.
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done!');
