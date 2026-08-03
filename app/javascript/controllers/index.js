import { application } from "controllers/application"

// Lazy-load controllers so an element's controller downloads only when it mounts.
import { lazyLoadControllersFrom } from "@hotwired/stimulus-loading"
lazyLoadControllersFrom("controllers", application)
