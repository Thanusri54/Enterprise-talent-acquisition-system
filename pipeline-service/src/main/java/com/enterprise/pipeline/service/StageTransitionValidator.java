package com.enterprise.pipeline.service;

import com.enterprise.pipeline.entity.PipelineStage;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

@Component
public class StageTransitionValidator {

    private static final Map<PipelineStage, Set<PipelineStage>> ALLOWED_TRANSITIONS = Map.of(
            PipelineStage.APPLIED, Set.of(PipelineStage.SCREENING, PipelineStage.SHORTLISTED, PipelineStage.REJECTED, PipelineStage.ON_HOLD),
            PipelineStage.SCREENING, Set.of(PipelineStage.SHORTLISTED, PipelineStage.REJECTED, PipelineStage.ON_HOLD),
            PipelineStage.SHORTLISTED, Set.of(PipelineStage.INTERVIEW, PipelineStage.REJECTED, PipelineStage.ON_HOLD),
            PipelineStage.INTERVIEW, Set.of(PipelineStage.SELECTED, PipelineStage.OFFER, PipelineStage.HIRED, PipelineStage.REJECTED, PipelineStage.ON_HOLD),
            PipelineStage.SELECTED, Set.of(PipelineStage.OFFER, PipelineStage.HIRED, PipelineStage.REJECTED),
            PipelineStage.OFFER, Set.of(PipelineStage.HIRED, PipelineStage.REJECTED),
            PipelineStage.HIRED, Set.of(),
            PipelineStage.REJECTED, Set.of(PipelineStage.APPLIED, PipelineStage.SCREENING),
            PipelineStage.ON_HOLD, Set.of(PipelineStage.SCREENING, PipelineStage.SHORTLISTED, PipelineStage.INTERVIEW, PipelineStage.SELECTED)
    );

    public boolean isValidTransition(PipelineStage from, PipelineStage to, boolean forceMove) {
        if (forceMove) return true;
        if (from == null || to == null) return false;
        if (from == to) return true;
        Set<PipelineStage> allowed = ALLOWED_TRANSITIONS.get(from);
        return allowed != null && allowed.contains(to);
    }
}
