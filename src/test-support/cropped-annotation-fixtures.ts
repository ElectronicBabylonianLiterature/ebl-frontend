import { Factory } from 'fishery'
import {
  CroppedAnnotation,
  PcaClustering,
} from 'signs/domain/CroppedAnnotation'

export const pcaClusteringFactory = Factory.define<PcaClustering>(
  ({ sequence }) => ({
    clusterId: `cluster-${sequence}`,
    clusterRank: sequence,
    form: 'canonical',
    isCentroid: false,
    clusterSize: 1,
    isMain: false,
  }),
)

export const croppedAnnotationFactory = Factory.define<CroppedAnnotation>(
  ({ sequence }) => ({
    image: 'image',
    fragmentNumber: `K.${sequence}`,
    script: 'NA',
    label: 'label',
    annotationId: `annotation-${sequence}`,
  }),
)
