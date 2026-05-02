package httpapi

import "testing"

func TestRepresentativeGoldenChecksums(t *testing.T) {
	baseResponses := map[string]fixtureResponse{
		repoListURL("ok"): {
			Status: 200,
			BodyJSON: repoListJSON(
				repoJSON(false, "https://fixtures.test/repos/1/languages"),
				repoJSON(false, "https://fixtures.test/repos/2/languages"),
				repoJSON(true, "https://fixtures.test/repos/3/languages"),
			),
		},
		"https://fixtures.test/repos/1/languages": {
			Status:   200,
			BodyJSON: languageJSON(languageEntry("JavaScript", 120), languageEntry("Go", 80), languageEntry("Markdown", 20)),
		},
		"https://fixtures.test/repos/2/languages": {
			Status:   200,
			BodyJSON: languageJSON(languageEntry("TypeScript", 120), languageEntry("Rust", 20), languageEntry("JSON", 10)),
		},
		"https://fixtures.test/repos/3/languages": {
			Status:   200,
			BodyJSON: languageJSON(languageEntry("Shell", 9999)),
		},
	}

	cases := []struct {
		name     string
		rawQuery string
		expected string
	}{
		{
			name:     "missing username",
			rawQuery: "",
			expected: "f1ca4e478da675608a58ea73ea3e9a953259dda823fafb0e64b1a19d8f034784",
		},
		{
			name:     "success animated",
			rawQuery: "username=ok",
			expected: "c88a46a834675e5bb4b69cc503d2b085a6f2fbdbd1bf234a876f6d04bce17154",
		},
		{
			name:     "success static",
			rawQuery: "username=ok&disable_animations=true",
			expected: "0315f6ae5e9fd8cee94cfe0bd49f0de23298f07dd81ba3c0783fad8c6fbf83d7",
		},
	}

	for _, testCase := range cases {
		t.Run(testCase.name, func(t *testing.T) {
			response := runGoApp(t, testCase.rawQuery, baseResponses)
			if response.SHA256 != testCase.expected {
				t.Fatalf("golden checksum mismatch: got=%s want=%s", response.SHA256, testCase.expected)
			}
		})
	}
}
