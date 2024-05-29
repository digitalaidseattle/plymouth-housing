/**
 * DASSnackbar.tsx
 * 
 * Display an alert
 * user sererity for "error", "warning", "info", "success"
 * 
 * 
 */

import { afterEach, assert, describe, it, vi } from "vitest";
import { DASSnackbar } from "./DASSnackbar";
import { render } from "@testing-library/react";

describe('FirebaseSocial tests', () => {

    it('should render the DASSnackbar', () => {
        const element = render(<DASSnackbar open={true} message={"MESSAGE"} severity={"error"} onClose={() => { }} />);
        assert.isNotNull(element.queryByText('MESSAGE'));
    });


    afterEach(() => {
        vi.clearAllMocks();
    });

});
