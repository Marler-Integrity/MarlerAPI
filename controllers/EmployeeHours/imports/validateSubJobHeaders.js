/**
 * The exact header layout the internal-jobs import requires, in order.
 * Source of truth for SubJobs_Template.xlsx. The importer only consumes
 * JOB#, NAME, SubJob#, and Desc, but all five are required to match.
 */
const EXPECTED_HEADERS = ['JOB#', 'Comp', 'NAME', 'SubJob#', 'Desc'];

/**
 * Validates an uploaded SubJobs file's header row against EXPECTED_HEADERS.
 * Exact set + exact order, case-sensitive, with leading/trailing whitespace
 * trimmed from each header cell.
 *
 * @param {Array} rawHeaders - header row as produced by
 *   xlsx.utils.sheet_to_json(worksheet, { header: 1 })[0]. May be undefined,
 *   contain null/undefined cells, or be shorter/longer than EXPECTED_HEADERS.
 * @returns {{ valid: true, headers: string[] } | { valid: false, reason: string }}
 */
function validateSubJobHeaders(rawHeaders) {
  const headers = Array.isArray(rawHeaders) ? rawHeaders : [];
  const normalized = headers.map((cell) => String(cell ?? '').trim());

  if (normalized.length !== EXPECTED_HEADERS.length) {
    return {
      valid: false,
      reason: `expected ${EXPECTED_HEADERS.length} columns, received ${normalized.length}`,
    };
  }

  for (let i = 0; i < EXPECTED_HEADERS.length; i++) {
    if (normalized[i] !== EXPECTED_HEADERS[i]) {
      return {
        valid: false,
        reason: `column ${i + 1}: expected '${EXPECTED_HEADERS[i]}', got '${normalized[i]}'`,
      };
    }
  }

  return { valid: true, headers: normalized };
}

module.exports = { EXPECTED_HEADERS, validateSubJobHeaders };
