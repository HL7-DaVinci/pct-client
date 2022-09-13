export const exampleState = {
  patientList: [
    {
      fullUrl:
        "http://davinci-pct-ehr.logicahealth.org/fhir/Patient/patient1001",
      resource: {
        resourceType: "Patient",
        id: "patient1001",
        meta: {
          versionId: "1",
          lastUpdated: "2022-09-08T02:03:01.518+00:00",
          source: "#WTfll7l1BhgLHOxn",
          profile: [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-patient",
          ],
        },
        text: {
          status: "generated",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Eve Betterhalf</b> female, DoB: 1955-07-23 ( Member Number: 12345)</p></div>',
        },
        identifier: [
          {
            type: {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                  code: "MB",
                  display: "Member Number",
                },
              ],
            },
            system: "http://example.com/identifiers/member",
            value: "12345",
          },
          {
            type: {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                  code: "EI",
                  display: "Employee number",
                },
              ],
            },
            system: "http://example.com/identifiers/employee",
            value: "667788",
          },
        ],
        name: [
          {
            text: "Eve Betterhalf",
            family: "Betterhalf",
            given: ["Eve"],
          },
        ],
        telecom: [
          {
            system: "phone",
            value: "781-949-4949",
            use: "mobile",
          },
        ],
        gender: "female",
        birthDate: "1955-07-23",
        address: [
          {
            text: "222 Burlington Road, Bedford MA 01730",
          },
        ],
        maritalStatus: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
              code: "U",
              display: "unmarried",
            },
          ],
        },
        communication: [
          {
            language: {
              coding: [
                {
                  system: "urn:ietf:bcp:47",
                  code: "en-US",
                  display: "English (United States)",
                },
              ],
            },
            preferred: true,
          },
        ],
      },
      search: {
        mode: "match",
      },
    },
    {
      fullUrl:
        "http://davinci-pct-ehr.logicahealth.org/fhir/Patient/patient2930",
      resource: {
        resourceType: "Patient",
        id: "patient2930",
        meta: {
          versionId: "1",
          lastUpdated: "2022-09-08T02:03:02.032+00:00",
          source: "MANUAL#LRyZYjHW2hZbFIB4",
          profile: [
            "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
          ],
        },
        text: {
          status: "generated",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><div class="hapiHeaderText">Sydney <b>BINGMAN </b></div><table class="hapiPropertyTable"><tbody><tr><td>Identifier</td><td>H13936781</td></tr><tr><td>Address</td><td><span>480 E EVERGREEN AVE </span><br/><span>LONGWOOD </span><span>FL </span></td></tr><tr><td>Date of birth</td><td><span>01 March 1955</span></td></tr></tbody></table></div>',
        },
        identifier: [
          {
            system: "https://www.edifecs.com/fhir/CodeSystems/unique-member-id",
            value: "H13936781",
          },
          {
            use: "usual",
            system: "https://fhir.collablynk.com/edifecs/fhir/R4/",
            value: "2930",
          },
        ],
        name: [
          {
            family: "Bingman",
            given: ["Sydney"],
          },
        ],
        gender: "male",
        birthDate: "1955-03-01",
        address: [
          {
            use: "home",
            type: "physical",
            line: ["480 E EVERGREEN AVE"],
            city: "LONGWOOD",
            state: "FL",
            postalCode: "327505599",
          },
        ],
      },
      search: {
        mode: "match",
      },
    },
  ],
  patientRequestList: [],
  priorityList: [
    {
      fullUrl:
        "http://davinci-pct-ehr.logicahealth.org/fhir/Claim/PCT-GFE-Institutional-1",
      resource: {
        resourceType: "Claim",
        id: "PCT-GFE-Institutional-1",
        meta: {
          versionId: "1",
          lastUpdated: "2022-09-08T02:03:02.424+00:00",
          source: "#yyOWTEADHYMLvhBX",
          profile: [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/pct-gfe-Institutional",
          ],
        },
        text: {
          status: "extensions",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative</b></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource &quot;PCT-GFE-Institutional-1&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-pct-gfe-Institutional.html">PCT Good Faith Estimate Institutional</a></p></div><p><b>GFESubmitter</b>: <a href="Organization-Submitter-Org-1.html">Organization/Submitter-Org-1</a> &quot;GFE Service Help INC.&quot;</p><p><b>GFEProviderAssignedIdentifier</b>: id: GFEProviderAssignedID0001</p><p><b>ProviderEventMethodology</b>: EEMM1021</p><p><b>InterTransIdentifier</b>: id: InterTransID0001</p><blockquote><p><b>GFEServiceLinkingInfo</b></p><p><b>value</b>: 223452-2342-2435-008001</p><p><b>value</b>: 2021-10-31</p></blockquote><p><b>status</b>: active</p><p><b>type</b>: Institutional <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-claim-type.html">Claim Type Codes</a>#institutional)</span></p><p><b>use</b>: predetermination</p><p><b>patient</b>: <a href="Patient-patient1001.html">Patient/patient1001</a> &quot; BETTERHALF&quot;</p><p><b>created</b>: 2021-10-05</p><p><b>insurer</b>: <a href="Organization-org1001.html">Organization/org1001</a> &quot;Umbrella Insurance Company&quot;</p><p><b>provider</b>: <a href="Organization-org1002.html">Organization/org1002</a> &quot;Boston Radiology Center&quot;</p><p><b>priority</b>: Normal <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-processpriority.html">Process Priority Codes</a>#normal)</span></p><h3>Payees</h3><table class="grid"><tr><td>-</td><td><b>Type</b></td></tr><tr><td>*</td><td>Provider <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-payeetype.html">ClaimPayeeTypeCodes</a>#provider)</span></td></tr></table><p><b>referral</b>: <span>: Referral Number</span></p><h3>Diagnoses</h3><table class="grid"><tr><td>-</td><td><b>Sequence</b></td><td><b>Diagnosis[x]</b></td><td><b>Type</b></td><td><b>PackageCode</b></td></tr><tr><td>*</td><td>1</td><td>Unspecified focal traumatic brain injury <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-icd10CM.html">International Classification of Diseases, 10th Revision, Clinical Modification (ICD-10-CM)</a>#S06.30)</span></td><td>Principal Diagnosis <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-ex-diagnosistype.html">Example Diagnosis Type Codes</a>#principal)</span></td><td>Head trauma - concussion <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-ex-diagnosisrelatedgroup.html">Example Diagnosis Related Group Codes</a>#400)</span></td></tr></table><h3>Insurances</h3><table class="grid"><tr><td>-</td><td><b>Sequence</b></td><td><b>Focal</b></td><td><b>Coverage</b></td></tr><tr><td>*</td><td>1</td><td>true</td><td><a href="Coverage-coverage1001.html">Coverage/coverage1001</a></td></tr></table><blockquote><p><b>item</b></p><p><b>sequence</b>: 1</p><p><b>revenue</b>: Revenue Code 1 <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="CodeSystem-PCTGFEItemRevenueCS.html">PCT GFE Item Revenue Code System</a>#2011)</span></p><p><b>productOrService</b>: Some CPT Code 1 <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="CodeSystem-PCTGFEItemProcedureCodes.html">PCT GFE Item Procedure Code System</a>#33502)</span></p><p><b>modifier</b>: Some CPT Code 2 <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="CodeSystem-PCTGFEItemProcedureCodes.html">PCT GFE Item Procedure Code System</a>#34503)</span></p><p><b>quantity</b>: 1</p><h3>Details</h3><table class="grid"><tr><td>-</td><td><b>Extension</b></td><td><b>Sequence</b></td><td><b>ProductOrService</b></td></tr><tr><td>*</td><td/><td>1</td><td>nitroglycerin  (product) <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-v3-ndc.html">National drug codes</a>#47781-457)</span></td></tr></table></blockquote></div>',
        },
        extension: [
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeSubmitter",
            valueReference: {
              reference: "Organization/Submitter-Org-1",
            },
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeProviderAssignedIdentifier",
            valueIdentifier: {
              value: "GFEProviderAssignedID0001",
            },
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/providerEventMethodology",
            valueString: "EEMM1021",
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/interTransIdentifier",
            valueIdentifier: {
              value: "InterTransID0001",
            },
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeServiceLinkingInfo",
            extension: [
              {
                url: "linkingIdentifier",
                valueString: "223452-2342-2435-008001",
              },
              {
                url: "plannedPeriodOfService",
                valueDate: "2021-10-31",
              },
            ],
          },
        ],
        status: "active",
        type: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/claim-type",
              code: "institutional",
              display: "Institutional",
            },
          ],
        },
        use: "predetermination",
        patient: {
          reference: "Patient/patient1001",
        },
        created: "2021-10-05",
        insurer: {
          reference: "Organization/org1001",
        },
        provider: {
          reference: "Organization/org1002",
        },
        priority: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/processpriority",
              code: "normal",
            },
          ],
        },
        payee: {
          type: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/payeetype",
                code: "provider",
              },
            ],
          },
        },
        referral: {
          extension: [
            {
              url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/referralNumber",
              valueString: "REF12022002-121",
            },
          ],
          display: "Referral Number",
        },
        diagnosis: [
          {
            sequence: 1,
            diagnosisCodeableConcept: {
              coding: [
                {
                  system: "http://hl7.org/fhir/sid/icd-10-cm",
                  code: "S06.30",
                  display: "Unspecified focal traumatic brain injury",
                },
              ],
            },
            type: [
              {
                coding: [
                  {
                    system:
                      "http://terminology.hl7.org/CodeSystem/ex-diagnosistype",
                    code: "principal",
                  },
                ],
              },
            ],
            packageCode: {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystem/ex-diagnosisrelatedgroup",
                  code: "400",
                  display: "Head trauma - concussion",
                },
              ],
            },
          },
        ],
        insurance: [
          {
            sequence: 1,
            focal: true,
            coverage: {
              reference: "Coverage/coverage1001",
            },
          },
        ],
        item: [
          {
            sequence: 1,
            revenue: {
              coding: [
                {
                  system:
                    "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFEItemRevenueCS",
                  code: "2011",
                  display: "Revenue Code 1",
                },
              ],
            },
            productOrService: {
              coding: [
                {
                  system:
                    "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFEItemProcedureCodes",
                  code: "33502",
                  display: "Some CPT Code 1",
                },
              ],
            },
            modifier: [
              {
                coding: [
                  {
                    system:
                      "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFEItemProcedureCodes",
                    code: "34503",
                    display: "Some CPT Code 2",
                  },
                ],
              },
            ],
            quantity: {
              value: 1,
            },
            net: {
              value: 200,
              currency: "USD",
            },
            detail: [
              {
                extension: [
                  {
                    url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/compoundDrugLinkingNum",
                    valueInteger: 123456,
                  },
                ],
                sequence: 1,
                productOrService: {
                  coding: [
                    {
                      system: "http://hl7.org/fhir/sid/ndc",
                      code: "47781-457",
                    },
                  ],
                },
              },
            ],
          },
        ],
        total: {
          value: 200,
          currency: "USD",
        },
      },
      search: {
        mode: "match",
      },
    },
    {
      fullUrl:
        "http://davinci-pct-ehr.logicahealth.org/fhir/Claim/PCT-GFE-Professional-1",
      resource: {
        resourceType: "Claim",
        id: "PCT-GFE-Professional-1",
        meta: {
          versionId: "1",
          lastUpdated: "2022-09-08T02:03:02.472+00:00",
          source: "#1pCc17AotBnm4yGy",
          profile: [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-gfe-professional",
          ],
        },
        text: {
          status: "extensions",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative</b></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource &quot;PCT-GFE-Professional-1&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-davinci-pct-gfe-professional.html">PCT Good Faith Estimate Professional</a></p></div><p><b>GFESubmitter</b>: <a href="Practitioner-Submitter-Practitioner-1.html">Practitioner/Submitter-Practitioner-1</a> &quot; OLOGIST&quot;</p><p><b>GFEProviderAssignedIdentifier</b>: id: GFEProviderAssignedID0002</p><p><b>ProviderEventMethodology</b>: EEMM1022</p><p><b>InterTransIdentifier</b>: id: InterTransID0002</p><blockquote><p><b>GFEServiceLinkingInfo</b></p><p><b>value</b>: 223452-2342-2435-008001</p><p><b>value</b>: 2021-10-31</p></blockquote><p><b>status</b>: active</p><p><b>type</b>: Professional <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-claim-type.html">Claim Type Codes</a>#professional)</span></p><p><b>use</b>: predetermination</p><p><b>patient</b>: <a href="Patient-patient1001.html">Patient/patient1001</a> &quot; BETTERHALF&quot;</p><p><b>created</b>: 2021-10-05</p><p><b>insurer</b>: <a href="Organization-org1001.html">Organization/org1001</a> &quot;Umbrella Insurance Company&quot;</p><p><b>provider</b>: <a href="PractitionerRole-pracRole002.html">PractitionerRole/pracRole002</a></p><p><b>priority</b>: Normal <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-processpriority.html">Process Priority Codes</a>#normal)</span></p><h3>Payees</h3><table class="grid"><tr><td>-</td><td><b>Type</b></td></tr><tr><td>*</td><td>Provider <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-payeetype.html">ClaimPayeeTypeCodes</a>#provider)</span></td></tr></table><p><b>referral</b>: <span>: Referral Number</span></p><h3>Diagnoses</h3><table class="grid"><tr><td>-</td><td><b>Sequence</b></td><td><b>Diagnosis[x]</b></td><td><b>Type</b></td><td><b>PackageCode</b></td></tr><tr><td>*</td><td>1</td><td>Unspecified focal traumatic brain injury <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-icd10CM.html">International Classification of Diseases, 10th Revision, Clinical Modification (ICD-10-CM)</a>#S06.30)</span></td><td>Principal Diagnosis <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-ex-diagnosistype.html">Example Diagnosis Type Codes</a>#principal)</span></td><td>Head trauma - concussion <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-ex-diagnosisrelatedgroup.html">Example Diagnosis Related Group Codes</a>#400)</span></td></tr></table><h3>Insurances</h3><table class="grid"><tr><td>-</td><td><b>Sequence</b></td><td><b>Focal</b></td><td><b>Coverage</b></td></tr><tr><td>*</td><td>1</td><td>true</td><td><a href="Coverage-coverage1001.html">Coverage/coverage1001</a></td></tr></table><blockquote><p><b>item</b></p><p><b>EstimatedDateOfService</b>: 2021-10-31</p><p><b>GFEBillingProviderLineItemCtrlNum</b>: id: GFEBillingProviderLineItemCtrlNum-0001</p><p><b>sequence</b>: 1</p><p><b>productOrService</b>: Some CPT Code 1 <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="CodeSystem-PCTGFEItemProcedureCodes.html">PCT GFE Item Procedure Code System</a>#33502)</span></p><p><b>modifier</b>: Some CPT Code 2 <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="CodeSystem-PCTGFEItemProcedureCodes.html">PCT GFE Item Procedure Code System</a>#34503)</span></p><p><b>location</b>: Inpatient Hospital <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (2.16.840.1.113883.15.5#21)</span></p><p><b>quantity</b>: 1</p></blockquote></div>',
        },
        extension: [
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeSubmitter",
            valueReference: {
              reference: "Practitioner/Submitter-Practitioner-1",
            },
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeProviderAssignedIdentifier",
            valueIdentifier: {
              value: "GFEProviderAssignedID0002",
            },
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/providerEventMethodology",
            valueString: "EEMM1022",
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/interTransIdentifier",
            valueIdentifier: {
              value: "InterTransID0002",
            },
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeServiceLinkingInfo",
            extension: [
              {
                url: "linkingIdentifier",
                valueString: "223452-2342-2435-008001",
              },
              {
                url: "plannedPeriodOfService",
                valueDate: "2021-10-31",
              },
            ],
          },
        ],
        status: "active",
        type: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/claim-type",
              code: "professional",
              display: "Professional",
            },
          ],
        },
        use: "predetermination",
        patient: {
          reference: "Patient/patient1001",
        },
        created: "2021-10-05",
        insurer: {
          reference: "Organization/org1001",
        },
        provider: {
          reference: "PractitionerRole/pracRole002",
        },
        priority: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/processpriority",
              code: "normal",
            },
          ],
        },
        payee: {
          type: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/payeetype",
                code: "provider",
              },
            ],
          },
        },
        referral: {
          extension: [
            {
              url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/referralNumber",
              valueString: "REF12022002-122",
            },
          ],
          display: "Referral Number",
        },
        diagnosis: [
          {
            sequence: 1,
            diagnosisCodeableConcept: {
              coding: [
                {
                  system: "http://hl7.org/fhir/sid/icd-10-cm",
                  code: "S06.30",
                  display: "Unspecified focal traumatic brain injury",
                },
              ],
            },
            type: [
              {
                coding: [
                  {
                    system:
                      "http://terminology.hl7.org/CodeSystem/ex-diagnosistype",
                    code: "principal",
                  },
                ],
              },
            ],
            packageCode: {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystem/ex-diagnosisrelatedgroup",
                  code: "400",
                  display: "Head trauma - concussion",
                },
              ],
            },
          },
        ],
        insurance: [
          {
            sequence: 1,
            focal: true,
            coverage: {
              reference: "Coverage/coverage1001",
            },
          },
        ],
        item: [
          {
            extension: [
              {
                url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/estimatedDateOfService",
                valueDate: "2021-10-31",
              },
              {
                url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeBillingProviderLineItemCtrlNum",
                valueIdentifier: {
                  value: "GFEBillingProviderLineItemCtrlNum-0001",
                },
              },
            ],
            sequence: 1,
            productOrService: {
              coding: [
                {
                  system:
                    "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFEItemProcedureCodes",
                  code: "33502",
                  display: "Some CPT Code 1",
                },
              ],
            },
            modifier: [
              {
                coding: [
                  {
                    system:
                      "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFEItemProcedureCodes",
                    code: "34503",
                    display: "Some CPT Code 2",
                  },
                ],
              },
            ],
            locationCodeableConcept: {
              coding: [
                {
                  system: "https://oidref.com/2.16.840.1.113883.15.5",
                  code: "21",
                  display: "Inpatient Hospital",
                },
              ],
            },
            quantity: {
              value: 1,
            },
            unitPrice: {
              value: 200,
            },
            net: {
              value: 200,
              currency: "USD",
            },
          },
        ],
        total: {
          value: 200,
          currency: "USD",
        },
      },
      search: {
        mode: "match",
      },
    },
    {
      fullUrl:
        "http://davinci-pct-ehr.logicahealth.org/fhir/Claim/PCT-GFE-Institutional-MRI",
      resource: {
        resourceType: "Claim",
        id: "PCT-GFE-Institutional-MRI",
        meta: {
          versionId: "1",
          lastUpdated: "2022-09-08T02:03:02.513+00:00",
          source: "#uMy6lnMH5I56ydqe",
          profile: [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/pct-gfe-Institutional",
          ],
        },
        text: {
          status: "extensions",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative</b></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource &quot;PCT-GFE-Institutional-MRI&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-pct-gfe-Institutional.html">PCT Good Faith Estimate Institutional</a></p></div><p><b>GFESubmitter</b>: <a href="Organization-Submitter-Org-1.html">Organization/Submitter-Org-1</a> &quot;GFE Service Help INC.&quot;</p><p><b>GFEProviderAssignedIdentifier</b>: id: GFEProviderAssignedID0001</p><p><b>ProviderEventMethodology</b>: EEMM1021</p><p><b>InterTransIdentifier</b>: id: InterTransID0001</p><blockquote><p><b>GFEServiceLinkingInfo</b></p><p><b>value</b>: 223452-2342-2435-008002</p><p><b>value</b>: 2022-02-02</p></blockquote><p><b>status</b>: active</p><p><b>type</b>: Institutional <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-claim-type.html">Claim Type Codes</a>#institutional)</span></p><p><b>use</b>: predetermination</p><p><b>patient</b>: <a href="Patient-patient1001.html">Patient/patient1001</a> &quot; BETTERHALF&quot;</p><p><b>created</b>: 2022-02-02</p><p><b>insurer</b>: <a href="Organization-org1001.html">Organization/org1001</a> &quot;Umbrella Insurance Company&quot;</p><p><b>provider</b>: <a href="Organization-org1002.html">Organization/org1002</a> &quot;Boston Radiology Center&quot;</p><p><b>priority</b>: Normal <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-processpriority.html">Process Priority Codes</a>#normal)</span></p><h3>Payees</h3><table class="grid"><tr><td>-</td><td><b>Type</b></td></tr><tr><td>*</td><td>Provider <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-payeetype.html">ClaimPayeeTypeCodes</a>#provider)</span></td></tr></table><p><b>referral</b>: <span>: Referral Number</span></p><h3>Diagnoses</h3><table class="grid"><tr><td>-</td><td><b>Sequence</b></td><td><b>Diagnosis[x]</b></td><td><b>Type</b></td><td><b>PackageCode</b></td></tr><tr><td>*</td><td>1</td><td>Unspecified focal traumatic brain injury <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-icd10CM.html">International Classification of Diseases, 10th Revision, Clinical Modification (ICD-10-CM)</a>#S06.30)</span></td><td>Principal Diagnosis <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-ex-diagnosistype.html">Example Diagnosis Type Codes</a>#principal)</span></td><td>Head trauma - concussion <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-ex-diagnosisrelatedgroup.html">Example Diagnosis Related Group Codes</a>#400)</span></td></tr></table><h3>Insurances</h3><table class="grid"><tr><td>-</td><td><b>Sequence</b></td><td><b>Focal</b></td><td><b>Coverage</b></td></tr><tr><td>*</td><td>1</td><td>true</td><td><a href="Coverage-coverage1001.html">Coverage/coverage1001</a></td></tr></table><blockquote><p><b>item</b></p><p><b>sequence</b>: 1</p><p><b>revenue</b>: Magnetic Resonance Technology (MRT) - Brain/brain stem <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="CodeSystem-PCTGFEItemRevenueCS.html">PCT GFE Item Revenue Code System</a>#0611)</span></p><p><b>productOrService</b>: Magnetic resonance (eg, proton) imaging, brain (including brain stem) <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="CodeSystem-PCTGFEItemProcedureCodes.html">PCT GFE Item Procedure Code System</a>#70551)</span></p><p><b>quantity</b>: 1</p></blockquote></div>',
        },
        extension: [
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeSubmitter",
            valueReference: {
              reference: "Organization/Submitter-Org-1",
            },
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeProviderAssignedIdentifier",
            valueIdentifier: {
              value: "GFEProviderAssignedID0001",
            },
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/providerEventMethodology",
            valueString: "EEMM1021",
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/interTransIdentifier",
            valueIdentifier: {
              value: "InterTransID0001",
            },
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeServiceLinkingInfo",
            extension: [
              {
                url: "linkingIdentifier",
                valueString: "223452-2342-2435-008002",
              },
              {
                url: "plannedPeriodOfService",
                valueDate: "2022-02-02",
              },
            ],
          },
        ],
        status: "active",
        type: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/claim-type",
              code: "institutional",
              display: "Institutional",
            },
          ],
        },
        use: "predetermination",
        patient: {
          reference: "Patient/patient1001",
        },
        created: "2022-02-02",
        insurer: {
          reference: "Organization/org1001",
        },
        provider: {
          reference: "Organization/org1002",
        },
        priority: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/processpriority",
              code: "normal",
            },
          ],
        },
        payee: {
          type: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/payeetype",
                code: "provider",
              },
            ],
          },
        },
        referral: {
          extension: [
            {
              url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/referralNumber",
              valueString: "REF12022002-122",
            },
          ],
          display: "Referral Number",
        },
        diagnosis: [
          {
            sequence: 1,
            diagnosisCodeableConcept: {
              coding: [
                {
                  system: "http://hl7.org/fhir/sid/icd-10-cm",
                  code: "S06.30",
                  display: "Unspecified focal traumatic brain injury",
                },
              ],
            },
            type: [
              {
                coding: [
                  {
                    system:
                      "http://terminology.hl7.org/CodeSystem/ex-diagnosistype",
                    code: "principal",
                  },
                ],
              },
            ],
            packageCode: {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystem/ex-diagnosisrelatedgroup",
                  code: "400",
                  display: "Head trauma - concussion",
                },
              ],
            },
          },
        ],
        insurance: [
          {
            sequence: 1,
            focal: true,
            coverage: {
              reference: "Coverage/coverage1001",
            },
          },
        ],
        item: [
          {
            sequence: 1,
            revenue: {
              coding: [
                {
                  system:
                    "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFEItemRevenueCS",
                  code: "0611",
                  display:
                    "Magnetic Resonance Technology (MRT) - Brain/brain stem",
                },
              ],
            },
            productOrService: {
              coding: [
                {
                  system:
                    "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFEItemProcedureCodes",
                  code: "70551",
                  display:
                    "Magnetic resonance (eg, proton) imaging, brain (including brain stem)",
                },
              ],
            },
            quantity: {
              value: 1,
            },
            net: {
              value: 266,
              currency: "USD",
            },
          },
        ],
        total: {
          value: 266,
          currency: "USD",
        },
      },
      search: {
        mode: "match",
      },
    },
  ],
  practitionerRoleList: [
    {
      resourceType: "PractitionerRole",
      id: "pracRole002",
      meta: {
        versionId: "1",
        lastUpdated: "2022-09-10T06:13:50.368+00:00",
        source: "#N27qMRo8Ez0N2AlN",
        profile: [
          "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-practitionerrole",
        ],
      },
      text: {
        status: "generated",
        div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative</b></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource &quot;pracRole002&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-davinci-pct-practitionerrole.html">PCT PractitionerRole</a></p></div><p><b>active</b>: true</p><p><b>practitioner</b>: <a href="Practitioner-prac002.html">Practitioner/prac002</a> &quot; CURIE&quot;</p><p><b>organization</b>: <a href="Organization-org1002.html">Organization/org1002</a> &quot;Boston Radiology Center&quot;</p><p><b>code</b>: Radiologic Technologist <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (provider-taxonomy#247100000X)</span></p><p><b>specialty</b>: Magnetic Resonance Imaging (MRI) Clinic/Center <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (provider-taxonomy#261QM1200X)</span></p><p><b>location</b>: <a href="Location-Provider-Org-Loc-2.html">Location/Provider-Org-Loc-2</a> &quot;Boston Radiology Center&quot;</p><p><b>telecom</b>: ph: 781-232-3232</p></div>',
      },
      active: true,
      practitioner: {
        reference: "Practitioner/prac002",
      },
      organization: {
        reference: "Organization/org1002",
      },
      code: [
        {
          coding: [
            {
              system: "http://nucc.org/provider-taxonomy",
              code: "247100000X",
              display: "Radiologic Technologist",
            },
          ],
        },
      ],
      specialty: [
        {
          coding: [
            {
              system: "http://nucc.org/provider-taxonomy",
              code: "261QM1200X",
              display: "Magnetic Resonance Imaging (MRI) Clinic/Center",
            },
          ],
        },
      ],
      location: [
        {
          reference: "Location/Provider-Org-Loc-2",
        },
      ],
      telecom: [
        {
          system: "phone",
          value: "781-232-3232",
        },
      ],
    },
  ],
  selectedPractitioner: [],
  practitionerList: [
    {
      fullUrl:
        "http://davinci-pct-ehr.logicahealth.org/fhir/Practitioner/Submitter-Practitioner-1",
      resource: {
        resourceType: "Practitioner",
        id: "Submitter-Practitioner-1",
        meta: {
          versionId: "1",
          lastUpdated: "2022-09-10T06:13:49.983+00:00",
          source: "#1uVjJVQzTmuh3Wav",
          profile: [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-practitioner",
          ],
        },
        text: {
          status: "generated",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative</b></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource &quot;Submitter-Practitioner-1&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-davinci-pct-practitioner.html">PCT Practitioner</a></p></div><p><b>identifier</b>: National provider identifier: 6456789016, Electronic Transmitter Identification Number: ETIN-20020001</p><p><b>active</b>: true</p><p><b>name</b>: Nora Ologist</p><p><b>telecom</b>: ph: 860-547-3301(WORK), <a href="mailto:csender@GFEServiceHelp.com">csender@GFEServiceHelp.com</a></p></div>',
        },
        identifier: [
          {
            type: {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                  code: "NPI",
                  display: "National provider identifier",
                },
              ],
            },
            system: "http://hl7.org/fhir/sid/us-npi",
            value: "6456789016",
          },
          {
            type: {
              coding: [
                {
                  system:
                    "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTOrgIdentifierTypeCS",
                  code: "ETIN",
                  display: "Electronic Transmitter Identification Number",
                },
              ],
            },
            system: "http://example.com/us-etin",
            value: "ETIN-20020001",
          },
        ],
        active: true,
        name: [
          {
            text: "Nora Ologist",
            family: "Ologist",
            given: ["Nora"],
          },
        ],
        telecom: [
          {
            system: "phone",
            value: "860-547-3301",
            use: "work",
          },
          {
            system: "email",
            value: "csender@GFEServiceHelp.com",
            use: "work",
          },
        ],
      },
      search: {
        mode: "match",
      },
    },
    {
      fullUrl:
        "http://davinci-pct-ehr.logicahealth.org/fhir/Practitioner/prac001",
      resource: {
        resourceType: "Practitioner",
        id: "prac001",
        meta: {
          versionId: "1",
          lastUpdated: "2022-09-10T06:13:50.020+00:00",
          source: "#Yv9Z4LvvtV2IwDhE",
          profile: [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-practitioner",
          ],
        },
        text: {
          status: "extensions",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative</b></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource &quot;prac001&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-davinci-pct-practitioner.html">PCT Practitioner</a></p></div><p><b>PCTEndpoint</b>: <a href="Endpoint-endpoint001.html">Endpoint/endpoint001</a></p><p><b>identifier</b>: National provider identifier: 1234567893</p><p><b>active</b>: true</p><p><b>name</b>: Patricia\tPrimary</p><p><b>telecom</b>: ph: 781-232-3231</p><p><b>address</b>: 32 Fruit Street, Boston MA 02114</p><p><b>gender</b>: female</p></div>',
        },
        extension: [
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/endpoint",
            valueReference: {
              reference: "Endpoint/endpoint001",
            },
          },
        ],
        identifier: [
          {
            type: {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                  code: "NPI",
                  display: "National provider identifier",
                },
              ],
            },
            system: "http://hl7.org/fhir/sid/us-npi",
            value: "1234567893",
          },
        ],
        active: true,
        name: [
          {
            text: "Patricia\tPrimary",
            family: "Primary",
            given: ["Patricia"],
            prefix: ["Dr."],
          },
        ],
        telecom: [
          {
            system: "phone",
            value: "781-232-3231",
          },
        ],
        address: [
          {
            text: "32 Fruit Street, Boston MA 02114",
          },
        ],
        gender: "female",
      },
      search: {
        mode: "match",
      },
    },
    {
      fullUrl:
        "http://davinci-pct-ehr.logicahealth.org/fhir/Practitioner/prac002",
      resource: {
        resourceType: "Practitioner",
        id: "prac002",
        meta: {
          versionId: "1",
          lastUpdated: "2022-09-10T06:13:50.064+00:00",
          source: "#pkyFGCDRbzdzDVBH",
          profile: [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-practitioner",
          ],
        },
        text: {
          status: "generated",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative</b></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource &quot;prac002&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-davinci-pct-practitioner.html">PCT Practitioner</a></p></div><p><b>identifier</b>: National provider identifier: 1234567995</p><p><b>active</b>: true</p><p><b>name</b>: Christine Curie</p><p><b>telecom</b>: ph: 781-232-3232</p><p><b>address</b>: 32 Fruit Street, Boston MA 02114</p><p><b>gender</b>: female</p></div>',
        },
        identifier: [
          {
            type: {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                  code: "NPI",
                  display: "National provider identifier",
                },
              ],
            },
            system: "http://hl7.org/fhir/sid/us-npi",
            value: "1234567995",
          },
        ],
        active: true,
        name: [
          {
            text: "Christine Curie",
            family: "Curie",
            given: ["Christine"],
            prefix: ["Dr."],
          },
        ],
        telecom: [
          {
            system: "phone",
            value: "781-232-3232",
          },
        ],
        address: [
          {
            text: "32 Fruit Street, Boston MA 02114",
          },
        ],
        gender: "female",
      },
      search: {
        mode: "match",
      },
    },
  ],
  organizationList: [
    {
      fullUrl:
        "http://davinci-pct-ehr.logicahealth.org/fhir/Organization/Submitter-Org-1",
      resource: {
        resourceType: "Organization",
        id: "Submitter-Org-1",
        meta: {
          versionId: "1",
          lastUpdated: "2022-09-10T06:13:49.148+00:00",
          source: "#yB3JBEMgwEx4FBhQ",
          profile: [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-organization",
          ],
        },
        text: {
          status: "generated",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative</b></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource &quot;Submitter-Org-1&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-davinci-pct-organization.html">PCT Organization</a></p></div><p><b>identifier</b>: Electronic Transmitter Identification Number: ETIN-10010301</p><p><b>active</b>: true</p><p><b>type</b>: Institutional GFE Submitter <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="CodeSystem-PCTOrganizationTypeCS.html">PCT Organization Type Code System</a>#institutional-submitter)</span></p><p><b>name</b>: GFE Service Help INC.</p><h3>Contacts</h3><table class="grid"><tr><td>-</td><td><b>Purpose</b></td><td><b>Name</b></td><td><b>Telecom</b></td></tr><tr><td>*</td><td>GFE-related <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="CodeSystem-PCTOrgContactPurposeType.html">PCT Organization Contact Purpose Type Code System</a>#GFERELATED)</span></td><td>Clara Sender</td><td>ph: 781-632-3209(WORK), <a href="mailto:csender@GFEServiceHelp.com">csender@GFEServiceHelp.com</a></td></tr></table></div>',
        },
        identifier: [
          {
            type: {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                  code: "NPI",
                  display: "National provider identifier",
                },
              ],
            },
            system: "http://hl7.org/fhir/sid/us-npi",
            value: "1234568097",
          },
        ],
        active: true,
        type: [
          {
            coding: [
              {
                system:
                  "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTOrganizationTypeCS",
                code: "institutional-submitter",
                display: "Institutional GFE Submitter",
              },
            ],
          },
        ],
        name: "GFE Service Help INC.",
        contact: [
          {
            purpose: {
              coding: [
                {
                  system:
                    "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTOrgContactPurposeType",
                  code: "GFERELATED",
                  display: "GFE-related",
                },
              ],
            },
            name: {
              text: "Clara Sender",
            },
            telecom: [
              {
                system: "phone",
                value: "781-632-3209",
                use: "work",
              },
              {
                system: "email",
                value: "csender@GFEServiceHelp.com",
                use: "work",
              },
            ],
          },
        ],
      },
      search: {
        mode: "match",
      },
    },
    {
      fullUrl:
        "http://davinci-pct-ehr.logicahealth.org/fhir/Organization/org1001",
      resource: {
        resourceType: "Organization",
        id: "org1001",
        meta: {
          versionId: "1",
          lastUpdated: "2022-09-10T06:13:49.326+00:00",
          source: "#FEQ39NVJjvp46tH9",
          profile: [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-organization",
          ],
        },
        text: {
          status: "generated",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative</b></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource &quot;org1001&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-davinci-pct-organization.html">PCT Organization</a></p></div><p><b>identifier</b>: Electronic Transmitter Identification Number: ETIN-3200002</p><p><b>active</b>: true</p><p><b>type</b>: Payer <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-organization-type.html">Organization type</a>#pay)</span></p><p><b>name</b>: Umbrella Insurance Company</p><p><b>telecom</b>: ph: 860-547-5001(WORK)</p><p><b>address</b>: 680 Asylum Street Hartford CT 06155 US </p></div>',
        },
        identifier: [
          {
            type: {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                  code: "NPI",
                  display: "National provider identifier",
                },
              ],
            },
            system: "http://hl7.org/fhir/sid/us-npi",
            value: "1234568096",
          },
        ],
        active: true,
        type: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/organization-type",
                code: "pay",
                display: "Payer",
              },
            ],
          },
        ],
        name: "Umbrella Insurance Company",
        telecom: [
          {
            system: "phone",
            value: "860-547-5001",
            use: "work",
          },
        ],
        address: [
          {
            extension: [
              {
                url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/countrySubdivisionCode",
                valueCoding: {
                  system: "urn:iso:std:iso:3166:-2",
                  code: "US-CT",
                },
              },
            ],
            line: ["680 Asylum Street"],
            city: "Hartford",
            state: "CT",
            postalCode: "06155",
            country: "US",
          },
        ],
      },
      search: {
        mode: "match",
      },
    },
    {
      fullUrl:
        "http://davinci-pct-ehr.logicahealth.org/fhir/Organization/org1002",
      resource: {
        resourceType: "Organization",
        id: "org1002",
        meta: {
          versionId: "1",
          lastUpdated: "2022-09-10T06:13:49.362+00:00",
          source: "#M8Ua71RUhxV59ssr",
          profile: [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-organization",
          ],
        },
        text: {
          status: "extensions",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative</b></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource &quot;org1002&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-davinci-pct-organization.html">PCT Organization</a></p></div><p><b>ProviderTaxonomy</b>: Diagnostic Neuroimaging (Radiology) Physician <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (provider-taxonomy#2085D0003X)</span></p><p><b>identifier</b>: National provider identifier: 1234568095, Tax ID number: TAX-3211001</p><p><b>active</b>: true</p><p><b>type</b>: Healthcare Provider <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-organization-type.html">Organization type</a>#prov)</span></p><p><b>name</b>: Boston Radiology Center</p><p><b>telecom</b>: ph: 781-232-3200(WORK)</p><p><b>address</b>: 32 Fruit Street Boston MA 02114 US </p></div>',
        },
        extension: [
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/providerTaxonomy",
            valueCodeableConcept: {
              coding: [
                {
                  system: "http://nucc.org/provider-taxonomy",
                  code: "2085D0003X",
                  display: "Diagnostic Neuroimaging (Radiology) Physician",
                },
              ],
            },
          },
        ],
        identifier: [
          {
            type: {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                  code: "NPI",
                  display: "National provider identifier",
                },
              ],
            },
            system: "http://hl7.org/fhir/sid/us-npi",
            value: "1234568095",
          },
        ],
        active: true,
        type: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/organization-type",
                code: "prov",
                display: "Healthcare Provider",
              },
            ],
          },
        ],
        name: "Boston Radiology Center",
        telecom: [
          {
            system: "phone",
            value: "781-232-3200",
            use: "work",
          },
        ],
        address: [
          {
            extension: [
              {
                url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/countrySubdivisionCode",
                valueCoding: {
                  system: "urn:iso:std:iso:3166:-2",
                  code: "US-MA",
                },
              },
            ],
            line: ["32 Fruit Street"],
            city: "Boston",
            state: "MA",
            postalCode: "02114",
            country: "US",
          },
        ],
      },
      search: {
        mode: "match",
      },
    },
    {
      fullUrl:
        "http://davinci-pct-ehr.logicahealth.org/fhir/Organization/org2723",
      resource: {
        resourceType: "Organization",
        id: "org2723",
        meta: {
          versionId: "1",
          lastUpdated: "2022-09-10T06:13:49.404+00:00",
          source: "#RxpOSqrp2VyMMfKg",
          profile: [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-organization",
          ],
        },
        identifier: [
          {
            system: "https://www.edifecs.com/fhir/CodeSystems/payer-id",
            value: "FLBL123456789",
          },
          {
            use: "usual",
            system: "https://fhir.collablynk.com/edifecs/fhir/R4/",
            value: "2723",
          },
        ],
        active: true,
        type: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/organization-type",
                code: "pay",
                display: "Payer",
              },
            ],
          },
        ],
        name: "Florida Blue",
        telecom: [
          {
            system: "email",
            value: "support@floridablue.com",
          },
        ],
        address: [
          {
            line: ["P.O. Box 45074"],
            city: "Jacksonville",
            state: "FL",
            postalCode: "32232-5074",
          },
        ],
      },
      search: {
        mode: "match",
      },
    },
    {
      fullUrl:
        "http://davinci-pct-ehr.logicahealth.org/fhir/Organization/org2724",
      resource: {
        resourceType: "Organization",
        id: "org2724",
        meta: {
          versionId: "1",
          lastUpdated: "2022-09-10T06:13:49.441+00:00",
          source: "#4Zz65PvAbZL96EHN",
          profile: [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-organization",
          ],
        },
        identifier: [
          {
            use: "usual",
            system: "http://hl7.org/fhir/sid/us-npi",
            value: "1134102080",
          },
          {
            system: "urn:oid:2.16.840.1.113883.4.4",
            value: "679123456789",
          },
          {
            use: "usual",
            system: "https://www.edifecs.com/fhir/CodeSystems/id-org",
            value: "1134102080",
          },
          {
            use: "usual",
            system: "https://fhir.collablynk.com/edifecs/fhir/R4/",
            value: "2724",
          },
        ],
        active: true,
        type: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/organization-type",
                code: "prov",
                display: "Healthcare Provider",
              },
            ],
          },
        ],
        name: "Memorial Hospital West",
        telecom: [
          {
            system: "phone",
            value: "954-436-5000",
            use: "work",
          },
        ],
        address: [
          {
            use: "work",
            type: "postal",
            line: ["703 N Flamingo Rd"],
            city: "Pembroke Pines",
            state: "FL",
            postalCode: "33028",
          },
        ],
      },
      search: {
        mode: "match",
      },
    },
  ],
  resolvedReferences: {
    "Practitioner/prac002": {
      resourceType: "Practitioner",
      id: "prac002",
      meta: {
        versionId: "1",
        lastUpdated: "2022-09-02T18:28:57.654+00:00",
        source: "#p1QrVGBcVlXRqCZ1",
        profile: [
          "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-practitioner",
        ],
      },
      text: {
        status: "generated",
        div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative</b></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource &quot;prac002&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-davinci-pct-practitioner.html">PCT Practitioner</a></p></div><p><b>identifier</b>: National provider identifier: 1234567995</p><p><b>active</b>: true</p><p><b>name</b>: Christine Curie</p><p><b>telecom</b>: ph: 781-232-3232</p><p><b>address</b>: 32 Fruit Street, Boston MA 02114</p><p><b>gender</b>: female</p></div>',
      },
      identifier: [
        {
          type: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                code: "NPI",
                display: "National provider identifier",
              },
            ],
          },
          system: "http://hl7.org/fhir/sid/us-npi",
          value: "1234567995",
        },
      ],
      active: true,
      name: [
        {
          text: "Christine Curie",
          family: "Curie",
          given: ["Christine"],
          prefix: ["Dr."],
        },
      ],
      telecom: [
        {
          system: "phone",
          value: "781-232-3232",
        },
      ],
      address: [
        {
          text: "32 Fruit Street, Boston MA 02114",
        },
      ],
      gender: "female",
    },
    "Organization/org1002": {
      resourceType: "Organization",
      id: "org1002",
      meta: {
        versionId: "1",
        lastUpdated: "2022-09-02T18:28:56.476+00:00",
        source: "#cLIhWZ2HM7Bev70a",
        profile: [
          "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-organization",
        ],
      },
      text: {
        status: "extensions",
        div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative</b></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource &quot;org1002&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-davinci-pct-organization.html">PCT Organization</a></p></div><p><b>ProviderTaxonomy</b>: Diagnostic Neuroimaging (Radiology) Physician <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (provider-taxonomy#2085D0003X)</span></p><p><b>identifier</b>: National provider identifier: 1234568095, Tax ID number: TAX-3211001</p><p><b>active</b>: true</p><p><b>type</b>: Healthcare Provider <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-organization-type.html">Organization type</a>#prov)</span></p><p><b>name</b>: Boston Radiology Center</p><p><b>telecom</b>: ph: 781-232-3200(WORK)</p><p><b>address</b>: 32 Fruit Street Boston MA 02114 US </p></div>',
      },
      extension: [
        {
          url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/providerTaxonomy",
          valueCodeableConcept: {
            coding: [
              {
                system: "http://nucc.org/provider-taxonomy",
                code: "2085D0003X",
                display: "Diagnostic Neuroimaging (Radiology) Physician",
              },
            ],
          },
        },
      ],
      identifier: [
        {
          type: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                code: "NPI",
                display: "National provider identifier",
              },
            ],
          },
          system: "http://hl7.org/fhir/sid/us-npi",
          value: "1234568095",
        },
      ],
      active: true,
      type: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/organization-type",
              code: "prov",
              display: "Healthcare Provider",
            },
          ],
        },
      ],
      name: "Boston Radiology Center",
      telecom: [
        {
          system: "phone",
          value: "781-232-3200",
          use: "work",
        },
      ],
      address: [
        {
          extension: [
            {
              url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/countrySubdivisionCode",
              valueCoding: {
                system: "urn:iso:std:iso:3166:-2",
                code: "US-MA",
              },
            },
          ],
          line: ["32 Fruit Street"],
          city: "Boston",
          state: "MA",
          postalCode: "02114",
          country: "US",
        },
      ],
    },
    "Location/Provider-Org-Loc-2": {
      resourceType: "Location",
      id: "Provider-Org-Loc-2",
      meta: {
        versionId: "1",
        lastUpdated: "2022-09-02T18:28:57.836+00:00",
        source: "#8K2tQvCMcb5jLj0S",
        profile: [
          "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-location",
        ],
      },
      text: {
        status: "generated",
        div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative</b></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource &quot;Provider-Org-Loc-2&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-davinci-pct-location.html">PCT Location</a></p></div><p><b>status</b>: active</p><p><b>name</b>: Boston Radiology Center</p><p><b>address</b>: 32 Fruit Street, Boston MA 02114</p><p><b>managingOrganization</b>: <a href="Organization-org1002.html">Organization/org1002</a> &quot;Boston Radiology Center&quot;</p></div>',
      },
      status: "active",
      name: "Boston Radiology Center",
      address: {
        text: "32 Fruit Street, Boston MA 02114",
      },
      managingOrganization: {
        reference: "Organization/org1002",
      },
    },
  },
  openErrorDialog: false,
  verticalTabIndex: 0,
  currentTabIndex: 0,
  locationList: [
    {
      fullUrl:
        "http://davinci-pct-ehr.logicahealth.org/fhir/Location/Provider-Org-Loc-2",
      resource: {
        resourceType: "Location",
        id: "Provider-Org-Loc-2",
        meta: {
          versionId: "1",
          lastUpdated: "2022-09-10T06:13:50.322+00:00",
          source: "#qZEiinyQ6Fmhlgzr",
          profile: [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-location",
          ],
        },
        text: {
          status: "generated",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative</b></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource &quot;Provider-Org-Loc-2&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-davinci-pct-location.html">PCT Location</a></p></div><p><b>status</b>: active</p><p><b>name</b>: Boston Radiology Center</p><p><b>address</b>: 32 Fruit Street, Boston MA 02114</p><p><b>managingOrganization</b>: <a href="Organization-org1002.html">Organization/org1002</a> &quot;Boston Radiology Center&quot;</p></div>',
        },
        status: "active",
        name: "Boston Radiology Center",
        address: {
          text: "32 Fruit Street, Boston MA 02114",
        },
        managingOrganization: {
          reference: "Organization/org1002",
        },
      },
      search: {
        mode: "match",
      },
    },
  ],
  subjectInfo: {
    gfeType: "institutional",
    memberNumber: "12345",
    selectedAddress: "222 Burlington Road, Bedford MA 01730",
    birthdate: "1955-07-23",
    gender: "female",
    telephone: "781-949-4949",
    selectedPatient: "patient1001",
    selectedPayor: {
      resourceType: "Organization",
      id: "org1001",
      meta: {
        versionId: "1",
        lastUpdated: "2022-09-02T18:28:56.434+00:00",
        source: "#JGpCsoJ0OpCHCYFC",
        profile: [
          "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-organization",
        ],
      },
      text: {
        status: "generated",
        div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative</b></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource &quot;org1001&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-davinci-pct-organization.html">PCT Organization</a></p></div><p><b>identifier</b>: Electronic Transmitter Identification Number: ETIN-3200002</p><p><b>active</b>: true</p><p><b>type</b>: Payer <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-organization-type.html">Organization type</a>#pay)</span></p><p><b>name</b>: Umbrella Insurance Company</p><p><b>telecom</b>: ph: 860-547-5001(WORK)</p><p><b>address</b>: 680 Asylum Street Hartford CT 06155 US </p></div>',
      },
      identifier: [
        {
          type: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                code: "NPI",
                display: "National provider identifier",
              },
            ],
          },
          system: "http://hl7.org/fhir/sid/us-npi",
          value: "1234568096",
        },
      ],
      active: true,
      type: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/organization-type",
              code: "pay",
              display: "Payer",
            },
          ],
        },
      ],
      name: "Umbrella Insurance Company",
      telecom: [
        {
          system: "phone",
          value: "860-547-5001",
          use: "work",
        },
      ],
      address: [
        {
          extension: [
            {
              url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/countrySubdivisionCode",
              valueCoding: {
                system: "urn:iso:std:iso:3166:-2",
                code: "US-CT",
              },
            },
          ],
          line: ["680 Asylum Street"],
          city: "Hartford",
          state: "CT",
          postalCode: "06155",
          country: "US",
        },
      ],
    },
    selectedCoverage: {
      resourceType: "Coverage",
      id: "coverage1001",
      meta: {
        versionId: "1",
        lastUpdated: "2022-09-02T18:28:57.769+00:00",
        source: "#QJ6e7cwwV87JYpbM",
        profile: [
          "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/davinci-pct-coverage",
        ],
      },
      text: {
        status: "generated",
        div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative</b></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource &quot;coverage1001&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-davinci-pct-coverage.html">PCT Coverage</a></p></div><p><b>status</b>: active</p><p><b>subscriber</b>: <a href="Patient-patient1001.html">Patient/patient1001</a> &quot; BETTERHALF&quot;</p><p><b>subscriberId</b>: PFP123450000</p><p><b>beneficiary</b>: <a href="Patient-patient1001.html">Patient/patient1001</a> &quot; BETTERHALF&quot;</p><p><b>relationship</b>: Self <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-subscriber-relationship.html">SubscriberPolicyholder Relationship Codes</a>#self)</span></p><p><b>period</b>: 2021-01-01 --&gt; 2022-01-01</p><p><b>payor</b>: <a href="Organization-org1001.html">Organization/org1001</a> &quot;Umbrella Insurance Company&quot;</p><h3>Classes</h3><table class="grid"><tr><td>-</td><td><b>Type</b></td><td><b>Value</b></td><td><b>Name</b></td></tr><tr><td>*</td><td>Plan <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-coverage-class.html">Coverage Class Codes</a>#plan)</span></td><td>Premim Family Plus</td><td>Premim Family Plus Plan</td></tr></table><h3>CostToBeneficiaries</h3><table class="grid"><tr><td>-</td><td><b>Type</b></td><td><b>Value[x]</b></td></tr><tr><td>*</td><td>Copay Percentage <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-coverage-copay-type.html">Coverage Copay Type Codes</a>#copaypct)</span></td><td>20</td></tr></table><p><b>contract</b>: <a href="Contract-contract1001.html">Contract/contract1001</a></p></div>',
      },
      status: "active",
      subscriber: {
        reference: "Patient/patient1001",
      },
      subscriberId: "PFP123450000",
      beneficiary: {
        reference: "Patient/patient1001",
      },
      relationship: {
        coding: [
          {
            system:
              "http://terminology.hl7.org/CodeSystem/subscriber-relationship",
            code: "self",
            display: "Self",
          },
        ],
      },
      period: {
        start: "2021-01-01",
        end: "2022-01-01",
      },
      payor: [
        {
          reference: "Organization/org1001",
        },
      ],
      class: [
        {
          type: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/coverage-class",
                code: "plan",
                display: "Plan",
              },
            ],
          },
          value: "Premim Family Plus",
          name: "Premim Family Plus Plan",
        },
      ],
      costToBeneficiary: [
        {
          type: {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/coverage-copay-type",
                code: "copaypct",
                display: "Copay Percentage",
              },
            ],
          },
          valueQuantity: {
            value: 20,
          },
        },
      ],
      contract: [
        {
          reference: "Contract/contract1001",
        },
      ],
    },
    subscriber: "PFP123450000",
    subscriberRelationship: "Self",
    coveragePlan: "Premim Family Plus Plan",
    coveragePeriod: "2021-01-01 to 2022-01-01",
    selectedBillingProvider: null,
    selectedSubmitter: "Submitter-Org-1",
  },
  gfeInfo: {
    "62043a78-bbe5-41cf-ada3-ccaef03a4b60": {
      careTeamList: [
        {
          id: "570f8ab4-2059-4c81-b471-4291e9ef472e",
          role: "Rendering",
          provider: "Practitioner - Nora Ologist",
        },
      ],
      diagnosisList: [
        {
          id: "8cec6947-a0d0-4b81-ae38-f0746bb5f28c",
          diagnosis: "S06.3 Focal traumatic brain injury",
          type: "Principal",
        },
      ],
      procedureList: [
        {
          id: "f93e229a-393f-4f57-9fcc-ea0abc37671b",
        },
      ],
      claimItemList: [
        {
          id: "9e77e398-59eb-40f8-a644-a102b00be017",
          quantity: 1,
          productOrService:
            "70551: Magnetic resonance (eg, proton) imaging, brain (including brain stem)",
          unitPrice: 266,
          estimatedDateOfService: "2022-09-08T04:00:00.000Z",
          placeOfService: "Pharmacy",
        },
      ],
      selectedPriority: {
        resourceType: "Claim",
        id: "PCT-GFE-Institutional-1",
        meta: {
          versionId: "1",
          lastUpdated: "2022-09-08T02:03:02.424+00:00",
          source: "#yyOWTEADHYMLvhBX",
          profile: [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/pct-gfe-Institutional",
          ],
        },
        text: {
          status: "extensions",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative</b></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource &quot;PCT-GFE-Institutional-1&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-pct-gfe-Institutional.html">PCT Good Faith Estimate Institutional</a></p></div><p><b>GFESubmitter</b>: <a href="Organization-Submitter-Org-1.html">Organization/Submitter-Org-1</a> &quot;GFE Service Help INC.&quot;</p><p><b>GFEProviderAssignedIdentifier</b>: id: GFEProviderAssignedID0001</p><p><b>ProviderEventMethodology</b>: EEMM1021</p><p><b>InterTransIdentifier</b>: id: InterTransID0001</p><blockquote><p><b>GFEServiceLinkingInfo</b></p><p><b>value</b>: 223452-2342-2435-008001</p><p><b>value</b>: 2021-10-31</p></blockquote><p><b>status</b>: active</p><p><b>type</b>: Institutional <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-claim-type.html">Claim Type Codes</a>#institutional)</span></p><p><b>use</b>: predetermination</p><p><b>patient</b>: <a href="Patient-patient1001.html">Patient/patient1001</a> &quot; BETTERHALF&quot;</p><p><b>created</b>: 2021-10-05</p><p><b>insurer</b>: <a href="Organization-org1001.html">Organization/org1001</a> &quot;Umbrella Insurance Company&quot;</p><p><b>provider</b>: <a href="Organization-org1002.html">Organization/org1002</a> &quot;Boston Radiology Center&quot;</p><p><b>priority</b>: Normal <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-processpriority.html">Process Priority Codes</a>#normal)</span></p><h3>Payees</h3><table class="grid"><tr><td>-</td><td><b>Type</b></td></tr><tr><td>*</td><td>Provider <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-payeetype.html">ClaimPayeeTypeCodes</a>#provider)</span></td></tr></table><p><b>referral</b>: <span>: Referral Number</span></p><h3>Diagnoses</h3><table class="grid"><tr><td>-</td><td><b>Sequence</b></td><td><b>Diagnosis[x]</b></td><td><b>Type</b></td><td><b>PackageCode</b></td></tr><tr><td>*</td><td>1</td><td>Unspecified focal traumatic brain injury <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-icd10CM.html">International Classification of Diseases, 10th Revision, Clinical Modification (ICD-10-CM)</a>#S06.30)</span></td><td>Principal Diagnosis <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-ex-diagnosistype.html">Example Diagnosis Type Codes</a>#principal)</span></td><td>Head trauma - concussion <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-ex-diagnosisrelatedgroup.html">Example Diagnosis Related Group Codes</a>#400)</span></td></tr></table><h3>Insurances</h3><table class="grid"><tr><td>-</td><td><b>Sequence</b></td><td><b>Focal</b></td><td><b>Coverage</b></td></tr><tr><td>*</td><td>1</td><td>true</td><td><a href="Coverage-coverage1001.html">Coverage/coverage1001</a></td></tr></table><blockquote><p><b>item</b></p><p><b>sequence</b>: 1</p><p><b>revenue</b>: Revenue Code 1 <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="CodeSystem-PCTGFEItemRevenueCS.html">PCT GFE Item Revenue Code System</a>#2011)</span></p><p><b>productOrService</b>: Some CPT Code 1 <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="CodeSystem-PCTGFEItemProcedureCodes.html">PCT GFE Item Procedure Code System</a>#33502)</span></p><p><b>modifier</b>: Some CPT Code 2 <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="CodeSystem-PCTGFEItemProcedureCodes.html">PCT GFE Item Procedure Code System</a>#34503)</span></p><p><b>quantity</b>: 1</p><h3>Details</h3><table class="grid"><tr><td>-</td><td><b>Extension</b></td><td><b>Sequence</b></td><td><b>ProductOrService</b></td></tr><tr><td>*</td><td/><td>1</td><td>nitroglycerin  (product) <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-v3-ndc.html">National drug codes</a>#47781-457)</span></td></tr></table></blockquote></div>',
        },
        extension: [
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeSubmitter",
            valueReference: {
              reference: "Organization/Submitter-Org-1",
            },
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeProviderAssignedIdentifier",
            valueIdentifier: {
              value: "GFEProviderAssignedID0001",
            },
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/providerEventMethodology",
            valueString: "EEMM1021",
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/interTransIdentifier",
            valueIdentifier: {
              value: "InterTransID0001",
            },
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeServiceLinkingInfo",
            extension: [
              {
                url: "linkingIdentifier",
                valueString: "223452-2342-2435-008001",
              },
              {
                url: "plannedPeriodOfService",
                valueDate: "2021-10-31",
              },
            ],
          },
        ],
        status: "active",
        type: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/claim-type",
              code: "institutional",
              display: "Institutional",
            },
          ],
        },
        use: "predetermination",
        patient: {
          reference: "Patient/patient1001",
        },
        created: "2021-10-05",
        insurer: {
          reference: "Organization/org1001",
        },
        provider: {
          reference: "Organization/org1002",
        },
        priority: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/processpriority",
              code: "normal",
            },
          ],
        },
        payee: {
          type: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/payeetype",
                code: "provider",
              },
            ],
          },
        },
        referral: {
          extension: [
            {
              url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/referralNumber",
              valueString: "REF12022002-121",
            },
          ],
          display: "Referral Number",
        },
        diagnosis: [
          {
            sequence: 1,
            diagnosisCodeableConcept: {
              coding: [
                {
                  system: "http://hl7.org/fhir/sid/icd-10-cm",
                  code: "S06.30",
                  display: "Unspecified focal traumatic brain injury",
                },
              ],
            },
            type: [
              {
                coding: [
                  {
                    system:
                      "http://terminology.hl7.org/CodeSystem/ex-diagnosistype",
                    code: "principal",
                  },
                ],
              },
            ],
            packageCode: {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystem/ex-diagnosisrelatedgroup",
                  code: "400",
                  display: "Head trauma - concussion",
                },
              ],
            },
          },
        ],
        insurance: [
          {
            sequence: 1,
            focal: true,
            coverage: {
              reference: "Coverage/coverage1001",
            },
          },
        ],
        item: [
          {
            sequence: 1,
            revenue: {
              coding: [
                {
                  system:
                    "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFEItemRevenueCS",
                  code: "2011",
                  display: "Revenue Code 1",
                },
              ],
            },
            productOrService: {
              coding: [
                {
                  system:
                    "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFEItemProcedureCodes",
                  code: "33502",
                  display: "Some CPT Code 1",
                },
              ],
            },
            modifier: [
              {
                coding: [
                  {
                    system:
                      "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFEItemProcedureCodes",
                    code: "34503",
                    display: "Some CPT Code 2",
                  },
                ],
              },
            ],
            quantity: {
              value: 1,
            },
            net: {
              value: 200,
              currency: "USD",
            },
            detail: [
              {
                extension: [
                  {
                    url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/compoundDrugLinkingNum",
                    valueInteger: 123456,
                  },
                ],
                sequence: 1,
                productOrService: {
                  coding: [
                    {
                      system: "http://hl7.org/fhir/sid/ndc",
                      code: "47781-457",
                    },
                  ],
                },
              },
            ],
          },
        ],
        total: {
          value: 200,
          currency: "USD",
        },
      },
      selectedBillingProvider: "org2724",
      gfeServiceId: "GFEAssignedServiceID0001",
      interTransIntermediary: "InterTransID0001",
      supportingInfoTypeOfBill: "bill",
      selectedBillingProviderName: "Organization - Memorial Hospital West",
    },
    "e5c7cfb9-1361-4cd4-8270-743c3892f6a7": {
      careTeamList: [
        {
          id: "53fa6d10-6b3e-4dda-8e61-49261d1bebe5",
          role: "Attending",
          provider: "Practitioner - Patricia Primary",
        },
      ],
      diagnosisList: [
        {
          id: "2fe85879-97ba-4926-9527-c29d1c9150c8",
          diagnosis: "S06.3 Focal traumatic brain injury",
          type: "Admitting",
        },
      ],
      procedureList: [
        {
          id: "3b7e2ac6-7e3a-4cd4-9653-4ff59d7d4dba",
        },
      ],
      claimItemList: [
        {
          id: "3c680fe8-0e7e-469b-973b-2edc959b71c3",
          quantity: 1,
          productOrService:
            "96413: Injection and Intravenous Infusion Chemotherapy and Other Highly Complex Drug or Highly Complex Biologic Agent Administration",
          unitPrice: 181.11,
          estimatedDateOfService: "2022-09-08T04:00:00.000Z",
          placeOfService: "Office",
        },
      ],
      selectedPriority: {
        resourceType: "Claim",
        id: "PCT-GFE-Institutional-1",
        meta: {
          versionId: "1",
          lastUpdated: "2022-09-08T02:03:02.424+00:00",
          source: "#yyOWTEADHYMLvhBX",
          profile: [
            "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/pct-gfe-Institutional",
          ],
        },
        text: {
          status: "extensions",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative</b></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource &quot;PCT-GFE-Institutional-1&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-pct-gfe-Institutional.html">PCT Good Faith Estimate Institutional</a></p></div><p><b>GFESubmitter</b>: <a href="Organization-Submitter-Org-1.html">Organization/Submitter-Org-1</a> &quot;GFE Service Help INC.&quot;</p><p><b>GFEProviderAssignedIdentifier</b>: id: GFEProviderAssignedID0001</p><p><b>ProviderEventMethodology</b>: EEMM1021</p><p><b>InterTransIdentifier</b>: id: InterTransID0001</p><blockquote><p><b>GFEServiceLinkingInfo</b></p><p><b>value</b>: 223452-2342-2435-008001</p><p><b>value</b>: 2021-10-31</p></blockquote><p><b>status</b>: active</p><p><b>type</b>: Institutional <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-claim-type.html">Claim Type Codes</a>#institutional)</span></p><p><b>use</b>: predetermination</p><p><b>patient</b>: <a href="Patient-patient1001.html">Patient/patient1001</a> &quot; BETTERHALF&quot;</p><p><b>created</b>: 2021-10-05</p><p><b>insurer</b>: <a href="Organization-org1001.html">Organization/org1001</a> &quot;Umbrella Insurance Company&quot;</p><p><b>provider</b>: <a href="Organization-org1002.html">Organization/org1002</a> &quot;Boston Radiology Center&quot;</p><p><b>priority</b>: Normal <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-processpriority.html">Process Priority Codes</a>#normal)</span></p><h3>Payees</h3><table class="grid"><tr><td>-</td><td><b>Type</b></td></tr><tr><td>*</td><td>Provider <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-payeetype.html">ClaimPayeeTypeCodes</a>#provider)</span></td></tr></table><p><b>referral</b>: <span>: Referral Number</span></p><h3>Diagnoses</h3><table class="grid"><tr><td>-</td><td><b>Sequence</b></td><td><b>Diagnosis[x]</b></td><td><b>Type</b></td><td><b>PackageCode</b></td></tr><tr><td>*</td><td>1</td><td>Unspecified focal traumatic brain injury <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-icd10CM.html">International Classification of Diseases, 10th Revision, Clinical Modification (ICD-10-CM)</a>#S06.30)</span></td><td>Principal Diagnosis <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-ex-diagnosistype.html">Example Diagnosis Type Codes</a>#principal)</span></td><td>Head trauma - concussion <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-ex-diagnosisrelatedgroup.html">Example Diagnosis Related Group Codes</a>#400)</span></td></tr></table><h3>Insurances</h3><table class="grid"><tr><td>-</td><td><b>Sequence</b></td><td><b>Focal</b></td><td><b>Coverage</b></td></tr><tr><td>*</td><td>1</td><td>true</td><td><a href="Coverage-coverage1001.html">Coverage/coverage1001</a></td></tr></table><blockquote><p><b>item</b></p><p><b>sequence</b>: 1</p><p><b>revenue</b>: Revenue Code 1 <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="CodeSystem-PCTGFEItemRevenueCS.html">PCT GFE Item Revenue Code System</a>#2011)</span></p><p><b>productOrService</b>: Some CPT Code 1 <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="CodeSystem-PCTGFEItemProcedureCodes.html">PCT GFE Item Procedure Code System</a>#33502)</span></p><p><b>modifier</b>: Some CPT Code 2 <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="CodeSystem-PCTGFEItemProcedureCodes.html">PCT GFE Item Procedure Code System</a>#34503)</span></p><p><b>quantity</b>: 1</p><h3>Details</h3><table class="grid"><tr><td>-</td><td><b>Extension</b></td><td><b>Sequence</b></td><td><b>ProductOrService</b></td></tr><tr><td>*</td><td/><td>1</td><td>nitroglycerin  (product) <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/3.1.0/CodeSystem-v3-ndc.html">National drug codes</a>#47781-457)</span></td></tr></table></blockquote></div>',
        },
        extension: [
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeSubmitter",
            valueReference: {
              reference: "Organization/Submitter-Org-1",
            },
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeProviderAssignedIdentifier",
            valueIdentifier: {
              value: "GFEProviderAssignedID0001",
            },
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/providerEventMethodology",
            valueString: "EEMM1021",
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/interTransIdentifier",
            valueIdentifier: {
              value: "InterTransID0001",
            },
          },
          {
            url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/gfeServiceLinkingInfo",
            extension: [
              {
                url: "linkingIdentifier",
                valueString: "223452-2342-2435-008001",
              },
              {
                url: "plannedPeriodOfService",
                valueDate: "2021-10-31",
              },
            ],
          },
        ],
        status: "active",
        type: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/claim-type",
              code: "institutional",
              display: "Institutional",
            },
          ],
        },
        use: "predetermination",
        patient: {
          reference: "Patient/patient1001",
        },
        created: "2021-10-05",
        insurer: {
          reference: "Organization/org1001",
        },
        provider: {
          reference: "Organization/org1002",
        },
        priority: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/processpriority",
              code: "normal",
            },
          ],
        },
        payee: {
          type: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/payeetype",
                code: "provider",
              },
            ],
          },
        },
        referral: {
          extension: [
            {
              url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/referralNumber",
              valueString: "REF12022002-121",
            },
          ],
          display: "Referral Number",
        },
        diagnosis: [
          {
            sequence: 1,
            diagnosisCodeableConcept: {
              coding: [
                {
                  system: "http://hl7.org/fhir/sid/icd-10-cm",
                  code: "S06.30",
                  display: "Unspecified focal traumatic brain injury",
                },
              ],
            },
            type: [
              {
                coding: [
                  {
                    system:
                      "http://terminology.hl7.org/CodeSystem/ex-diagnosistype",
                    code: "principal",
                  },
                ],
              },
            ],
            packageCode: {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystem/ex-diagnosisrelatedgroup",
                  code: "400",
                  display: "Head trauma - concussion",
                },
              ],
            },
          },
        ],
        insurance: [
          {
            sequence: 1,
            focal: true,
            coverage: {
              reference: "Coverage/coverage1001",
            },
          },
        ],
        item: [
          {
            sequence: 1,
            revenue: {
              coding: [
                {
                  system:
                    "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFEItemRevenueCS",
                  code: "2011",
                  display: "Revenue Code 1",
                },
              ],
            },
            productOrService: {
              coding: [
                {
                  system:
                    "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFEItemProcedureCodes",
                  code: "33502",
                  display: "Some CPT Code 1",
                },
              ],
            },
            modifier: [
              {
                coding: [
                  {
                    system:
                      "http://hl7.org/fhir/us/davinci-pct/CodeSystem/PCTGFEItemProcedureCodes",
                    code: "34503",
                    display: "Some CPT Code 2",
                  },
                ],
              },
            ],
            quantity: {
              value: 1,
            },
            net: {
              value: 200,
              currency: "USD",
            },
            detail: [
              {
                extension: [
                  {
                    url: "http://hl7.org/fhir/us/davinci-pct/StructureDefinition/compoundDrugLinkingNum",
                    valueInteger: 123456,
                  },
                ],
                sequence: 1,
                productOrService: {
                  coding: [
                    {
                      system: "http://hl7.org/fhir/sid/ndc",
                      code: "47781-457",
                    },
                  ],
                },
              },
            ],
          },
        ],
        total: {
          value: 200,
          currency: "USD",
        },
      },
      selectedBillingProvider: "org1002",
      gfeServiceId: "GFEAssignedServiceID0001",
      interTransIntermediary: "InterTransID0001",
      supportingInfoTypeOfBill: "bill2",
      selectedBillingProviderName: "Organization - Boston Radiology Center",
    },
  },
  selectedGFE: "62043a78-bbe5-41cf-ada3-ccaef03a4b60",
  patientSelected: true,
};
