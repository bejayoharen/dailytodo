import { generateN, skipN, unsafeGenerateN, unsafeSkipN } from './generator/RandomGenerator.js';
import { congruential32 } from './generator/LinearCongruential.js';
import mersenne from './generator/MersenneTwister.js';
import { xorshift128plus } from './generator/XorShift.js';
import { xoroshiro128plus } from './generator/XoroShiro.js';
import { uniformArrayIntDistribution } from './distribution/UniformArrayIntDistribution.js';
import { uniformBigIntDistribution } from './distribution/UniformBigIntDistribution.js';
import { uniformIntDistribution } from './distribution/UniformIntDistribution.js';
import { unsafeUniformArrayIntDistribution } from './distribution/UnsafeUniformArrayIntDistribution.js';
import { unsafeUniformBigIntDistribution } from './distribution/UnsafeUniformBigIntDistribution.js';
import { unsafeUniformIntDistribution } from './distribution/UnsafeUniformIntDistribution.js';
var __type = 'module';
var __version = '6.1.0';
var __commitHash = 'a413dd2b721516be2ef29adffb515c5ae67bfbad';
export { __type, __version, __commitHash, generateN, skipN, unsafeGenerateN, unsafeSkipN, congruential32, mersenne, xorshift128plus, xoroshiro128plus, uniformArrayIntDistribution, uniformBigIntDistribution, uniformIntDistribution, unsafeUniformArrayIntDistribution, unsafeUniformBigIntDistribution, unsafeUniformIntDistribution, };
