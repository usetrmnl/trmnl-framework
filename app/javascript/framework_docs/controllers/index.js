import { application } from "framework_docs/controllers/application"

// Lazy-load controllers so an element's controller downloads only when it mounts.
import { lazyLoadControllersFrom } from "@hotwired/stimulus-loading"
lazyLoadControllersFrom("framework_docs/controllers", application)
