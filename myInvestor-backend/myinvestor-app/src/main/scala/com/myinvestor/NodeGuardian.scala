package com.myinvestor

import akka.actor.{Actor, ActorContext, ActorRef, Props}
import com.myinvestor.actor._
import com.myinvestor.cluster.ClusterAwareNodeGuardian
import org.apache.spark.streaming.StreamingContext
import org.apache.spark.streaming.kafka010.DirectKafkaInputDStream

/**
  * A 'NodeGuardian' manages the worker actors at the root of each MyInvestor
  * deployed application, where any special application logic is handled in the
  * implementer here, but the cluster work, node lifecycle and supervision events
  * are handled in [[ClusterAwareNodeGuardian]], in 'myinvestor/myinvestor-core.
  *
  * This 'NodeGuardian' creates the [[KafkaStreamActor]] which creates a streaming
  * pipeline from Kafka to Cassandra, via Spark, which streams and transform the source data from Kafka,
  * and saves the new data to the cassandra data table on arrival.
  */
class NodeGuardian(kafkaParams: Map[String, Object], settings: AppSettings) extends ClusterAwareNodeGuardian with ActorBase {

  import TradeEvent._

  // val KafkaStreamActorName = "kafka-stream"

  // ------ COMMENTED - remove Kafka integration May 22nd 2017 ---
  // Creates the Kafka stream saving data and aggregated data to cassandra.
  // context.actorOf(Props(new KafkaStreamActor(kafkaParams, settings, self)), KafkaStreamActorName)

  // The Spark Cassandra computation actor
  val technicalAnalysis: ActorRef = context.actorOf(Props(new TechnicalAnalysisActor(settings)), "technical-analysis")

  override def preStart(): Unit = {
    super.preStart()
    cluster.joinSeedNodes(Vector(cluster.selfAddress))
  }

  /**
    * When [[OutputStreamInitialized]] is received in the parent actor, [[ClusterAwareNodeGuardian]],
    * from the [[KafkaStreamActor]] after it creates and defines the [[DirectKafkaInputDStream]],
    * the Spark Streaming checkpoint can be set, the [[StreamingContext]] can be started, and the
    * node guardian actor moves from [[uninitialized]] to [[initialized]]with [[ActorContext.become()]].
    *
    * @see [[ClusterAwareNodeGuardian]]
    */
  override def initialize(): Unit = {
    super.initialize()
    SparkContextUtils.startStreamingContext() // Start streaming context. Kafka MUST BE STARTED.
    context become initialized
  }

  // This node guardian's customer behavior once initialized.
  def initialized: Actor.Receive = {
    case e: TARequest => {
      log.info("Received technical analysis request")
      technicalAnalysis forward e
    }
    case GracefulShutdown => {
      log.info("Perform graceful shutdown")
      gracefulShutdown(sender())
    }
  }
}

