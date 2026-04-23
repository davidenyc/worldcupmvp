import { Check, FileSpreadsheet, Merge, ShieldCheck, Star, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImportJobRecord, SubmissionRecord, Venue } from "@/lib/types";

export function AdminDashboard({
  submissions,
  venues,
  importJobs = []
}: {
  submissions: SubmissionRecord[];
  venues: Venue[];
  importJobs?: ImportJobRecord[];
}) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-5">
        <div className="surface p-5">
          <div className="text-sm text-mist">Pending queue</div>
          <div className="mt-2 text-3xl font-semibold text-deep">{submissions.length}</div>
        </div>
        <div className="surface p-5">
          <div className="text-sm text-mist">Total venues</div>
          <div className="mt-2 text-3xl font-semibold text-deep">{venues.length}</div>
        </div>
        <div className="surface p-5">
          <div className="text-sm text-mist">Reservable</div>
          <div className="mt-2 text-3xl font-semibold text-deep">
            {venues.filter((venue) => venue.acceptsReservations).length}
          </div>
        </div>
        <div className="surface p-5">
          <div className="text-sm text-mist">Verified</div>
          <div className="mt-2 text-3xl font-semibold text-deep">
            {venues.filter((venue) => venue.verificationStatus === "verified").length}
          </div>
        </div>
        <div className="surface p-5">
          <div className="text-sm text-mist">Import jobs</div>
          <div className="mt-2 text-3xl font-semibold text-deep">{importJobs.length}</div>
        </div>
      </div>

      <div className="surface-strong p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-mist">Admin tools</div>
            <h2 className="text-2xl font-semibold text-deep">Imports, verification, duplicates, and featured controls</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              CSV import
            </Button>
            <Button variant="secondary">
              <Merge className="mr-2 h-4 w-4" />
              Merge duplicates
            </Button>
            <Button variant="secondary">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Bulk verify
            </Button>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-white bg-white p-5">
              <div className="text-sm uppercase tracking-[0.2em] text-mist">Recent import jobs</div>
              <div className="mt-4 space-y-3">
                {importJobs.map((job) => (
                  <div key={job.id} className="rounded-2xl bg-sky/35 p-4">
                    <div className="font-semibold text-deep">{job.fileName}</div>
                    <div className="mt-1 text-sm text-navy/70">
                      {job.sourceName} · {job.status} · {job.rowsProcessed} rows
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white bg-white p-5">
              <div className="text-sm uppercase tracking-[0.2em] text-mist">Bulk editing ideas</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>Bulk tag assignment</Badge>
                <Badge>Capacity editing</Badge>
                <Badge>Reservation link editing</Badge>
                <Badge>Source tracking</Badge>
                <Badge>Confidence scoring</Badge>
                <Badge>Featured controls</Badge>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="rounded-3xl border border-white bg-white p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-deep">{submission.name}</h3>
                      <Badge>{submission.countryAssociation}</Badge>
                      <Badge>{submission.borough}</Badge>
                      {submission.acceptsReservations && <Badge>Reservations</Badge>}
                    </div>
                    <p className="mt-2 text-sm text-navy/65">{submission.address}</p>
                    <p className="mt-4 max-w-3xl text-sm leading-6 text-navy/72">{submission.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {submission.approximateCapacity && <Badge>~{submission.approximateCapacity} cap.</Badge>}
                      <Badge>Confidence {Math.round(submission.sourceConfidence * 100)}%</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary">
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button variant="secondary">
                      <Star className="mr-2 h-4 w-4" />
                      Feature
                    </Button>
                    <Button variant="secondary">
                      <Merge className="mr-2 h-4 w-4" />
                      Merge
                    </Button>
                    <Button variant="secondary">
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
